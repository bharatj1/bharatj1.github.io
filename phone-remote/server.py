"""
Phone Remote Control Server for Windows
Run this on your Windows laptop. It starts an HTTP server on port 8080.
Bookmark http://<your-ip>:8080 on your phone.
"""

import subprocess
import os
import json
import socket
import time
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

PORT = 8080


def run_ps(command):
    result = subprocess.run(
        ["powershell", "-NoProfile", "-NonInteractive", "-Command", command],
        capture_output=True, text=True
    )
    return result.returncode == 0, result.stdout.strip() or result.stderr.strip()


_MUTE_PS_DEFS = r"""
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
[ClassInterface(ClassInterfaceType.None)]
public class DevEnumClass {}
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IDevEnum {
    void En(int a, int b, out IntPtr c);
    void GetDefault(int a, int b, out IDevice d);
    void GetDev(string a, out IDevice b);
    void Reg(IntPtr a); void Unreg(IntPtr a);
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IDevice {
    void Act([MarshalAs(UnmanagedType.LPStruct)] Guid g, int c, IntPtr p, [MarshalAs(UnmanagedType.IUnknown)] out object o);
    void Open(int a, out IntPtr b);
    void GetId([MarshalAs(UnmanagedType.LPWStr)] out string a);
    void GetSt(out int a);
}
[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
public interface IVol {
    void Reg(IntPtr a); void Unreg(IntPtr a); void GetCh(out uint a);
    void SetVol(float a, IntPtr b); void SetVolS(float a, IntPtr b);
    void GetVol(out float a); void GetVolS(out float a);
    void SetChV(uint a, float b, IntPtr c); void SetChVS(uint a, float b, IntPtr c);
    void GetChV(uint a, out float b); void GetChVS(uint a, out float b);
    void SetMute([MarshalAs(UnmanagedType.Bool)] bool a, IntPtr b);
    void GetMute([MarshalAs(UnmanagedType.Bool)] out bool a);
}
"@
$e = New-Object DevEnumClass -as [IDevEnum]
$d = $null; $e.GetDefault(0, 1, [ref]$d)
$o = $null; $g = [Guid]"5CDF2C82-841E-4546-9722-0CF74078229A"
$d.Act($g, 23, [IntPtr]::Zero, [ref]$o)
$v = $o -as [IVol]
"""


def _read_mute():
    """Read current mute state from Windows. Returns 'MUTED', 'UNMUTED', or ''."""
    ok, output = run_ps(_MUTE_PS_DEFS + r"""
$m = $false; $v.GetMute([ref]$m)
if ($m) { "MUTED" } else { "UNMUTED" }
""")
    return output.strip()


def mute_toggle():
    ok, output = run_ps(_MUTE_PS_DEFS + r"""
$m = $false; $v.GetMute([ref]$m)
$v.SetMute(-not $m, [IntPtr]::Zero)
$m2 = $false; $v.GetMute([ref]$m2)
if ($m2) { "MUTED" } else { "UNMUTED" }
""")
    output = output.strip()
    if output in ("MUTED", "UNMUTED"):
        return True, output
    # COM failed — use keybd_event (works from elevated process, bypasses UIPI)
    run_ps(r"""
Add-Type -TypeDefinition @"
using System; using System.Runtime.InteropServices;
public class MK {
    [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, int flags, IntPtr extra);
    public static void Mute() { keybd_event(0xAD,0,0,IntPtr.Zero); keybd_event(0xAD,0,2,IntPtr.Zero); }
}
"@
[MK]::Mute()
""")
    return True, "TOGGLED"


def get_mute_status():
    state = _read_mute()
    return True, state if state in ("MUTED", "UNMUTED") else "UNKNOWN"


def sleep_pc():
    ok, _ = run_ps("Add-Type -Assembly System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState('Suspend', $false, $false)")
    return ok, "💤 PC is going to sleep"


def reboot_pc():
    subprocess.Popen(["powershell", "-Command", "Start-Sleep 2; Restart-Computer -Force"])
    return True, "🔁 Rebooting in 2s"


# ─── Teams ────────────────────────────────────────────────────────────────────

TOKEN_FILE = os.path.join(os.path.dirname(__file__), "teams_token.json")

TEAMS_PRESENCE = {
    "Available":    ("Available",    "Available"),
    "Away":         ("Away",         "Away"),
    "Busy":         ("Busy",         "InACall"),
    "DoNotDisturb": ("DoNotDisturb", "DoNotDisturb"),
}


def get_teams_token():
    if not os.path.exists(TOKEN_FILE):
        return None, "Teams not set up — run setup_teams.py first"
    with open(TOKEN_FILE) as f:
        data = json.load(f)

    if time.time() < data.get("expires_at", 0) - 60:
        return data["access_token"], None

    body = urllib.parse.urlencode({
        "client_id":     data["client_id"],
        "grant_type":    "refresh_token",
        "refresh_token": data["refresh_token"],
        "scope":         "Presence.ReadWrite offline_access",
    }).encode()
    try:
        req = urllib.request.Request(
            f"https://login.microsoftonline.com/{data['tenant_id']}/oauth2/v2.0/token",
            data=body
        )
        with urllib.request.urlopen(req, timeout=8) as r:
            token = json.loads(r.read())
        data["access_token"]  = token["access_token"]
        data["refresh_token"] = token.get("refresh_token", data["refresh_token"])
        data["expires_at"]    = time.time() + token["expires_in"]
        with open(TOKEN_FILE, "w") as f:
            json.dump(data, f, indent=2)
        return data["access_token"], None
    except Exception as e:
        return None, f"Token refresh failed: {e}"


def set_teams_status(availability):
    token, err = get_teams_token()
    if not token:
        return False, err

    av, activity = TEAMS_PRESENCE[availability]
    body = json.dumps({
        "sessionId":          "phone-remote",
        "availability":       av,
        "activity":           activity,
        "expirationDuration": "PT1H",
    }).encode()
    req = urllib.request.Request(
        "https://graph.microsoft.com/v1.0/me/presence/setPresence",
        data=body, method="POST",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=8):
            pass
    except urllib.error.HTTPError as e:
        return False, f"Graph {e.code}: {e.read().decode()[:80]}"
    except Exception as e:
        return False, str(e)

    # Read back actual Teams presence to confirm
    time.sleep(1)
    try:
        vreq = urllib.request.Request(
            "https://graph.microsoft.com/v1.0/me/presence",
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(vreq, timeout=8) as r:
            data = json.loads(r.read())
            actual = data.get("availability", availability)
            return True, f"✓ Confirmed: {actual}"
    except Exception:
        return True, f"✓ Set to {availability}"


# ─── HTTP Server ───────────────────────────────────────────────────────────────

ACTIONS = {
    "/mute":             mute_toggle,
    "/mute/status":      get_mute_status,
    "/sleep":            sleep_pc,
    "/reboot":           reboot_pc,
    "/teams/available":  lambda: set_teams_status("Available"),
    "/teams/away":       lambda: set_teams_status("Away"),
    "/teams/busy":       lambda: set_teams_status("Busy"),
    "/teams/dnd":        lambda: set_teams_status("DoNotDisturb"),
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def send_json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path).path

        if path in ("/", "/index.html"):
            html = open(os.path.join(os.path.dirname(__file__), "index.html"), "rb").read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", len(html))
            self.end_headers()
            self.wfile.write(html)
            return

        if path in ACTIONS:
            try:
                ok, msg = ACTIONS[path]()
                self.send_json(200 if ok else 500, {"ok": ok, "msg": msg})
            except Exception as e:
                self.send_json(500, {"ok": False, "msg": str(e)})
            return

        self.send_json(404, {"ok": False, "msg": "Not found"})


if __name__ == "__main__":
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()

    print(f"\n  PC Remote running at  http://{ip}:{PORT}")
    print(f"  Open this on your phone ^\n")
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
