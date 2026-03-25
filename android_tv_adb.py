#!/usr/bin/env python3
"""
Android TV ADB Controller
Connects to Android TV over network (TCP/IP) and lets you send commands.

Requirements:
    pip install pure-python-adb

Usage:
    python android_tv_adb.py                        # uses default IP 192.168.1.115
    python android_tv_adb.py --ip 192.168.1.X
    python android_tv_adb.py --ip 192.168.1.X --port 5555

How to enable ADB on Android TV:
    Settings -> Device Preferences -> About -> Build (click 7 times)
    Settings -> Device Preferences -> Developer Options -> USB Debugging ON
    Settings -> Device Preferences -> Developer Options -> Network Debugging ON
"""

import argparse
import subprocess
import sys
import time
import readline
import rlcompleter

try:
    from ppadb.client import Client as AdbClient
except ImportError:
    print("Missing dependency. Run:  pip install pure-python-adb")
    sys.exit(1)

# ── Constants ────────────────────────────────────────────────────────────────

DEFAULT_TV_IP   = "192.168.1.115"
DEFAULT_TV_PORT = 5555

KEYCODES = {
    "home":       3,
    "back":       4,
    "up":         19,
    "down":       20,
    "left":       21,
    "right":      22,
    "enter":      66,
    "ok":         66,
    "play_pause": 85,
    "play":       126,
    "pause":      127,
    "stop":       86,
    "next":       87,
    "prev":       88,
    "vol_up":     24,
    "vol_down":   25,
    "mute":       164,
    "power":      26,
    "menu":       82,
    "search":     84,
    "info":       165,
    "ff":         90,
    "rw":         89,
    "sleep":      223,
}

COMMON_PACKAGES = {
    "youtube":   "com.google.android.youtube.tv",
    "netflix":   "com.netflix.ninja",
    "prime":     "com.amazon.amazonvideo.livingroom",
    "disney":    "com.disney.disneyplus",
    "plex":      "com.plexapp.android",
    "kodi":      "org.xbmc.kodi",
    "spotify":   "com.spotify.tv.android",
    "twitch":    "tv.twitch.android.app",
    "projectivy":"com.spocky.projengmenu",
}

COMMANDS = [
    "info", "key", "tap", "swipe", "text", "launch", "stop", "apps", "current",
    "screenshot", "shell", "vol", "volfix", "projectivy", "help", "quit", "exit",
    *COMMON_PACKAGES.keys(),
]

# ── Tab completion ────────────────────────────────────────────────────────────

def setup_readline():
    def completer(text, state):
        options = [c for c in COMMANDS if c.startswith(text)]
        return options[state] if state < len(options) else None
    readline.set_completer(completer)
    readline.parse_and_bind("tab: complete")

# ── AndroidTV class ──────────────────────────────────────────────────────────

class AndroidTV:
    def __init__(self, ip: str, port: int = DEFAULT_TV_PORT,
                 adb_host: str = "127.0.0.1", adb_port: int = 5037):
        self.ip = ip
        self.port = port
        self.device = None
        self._client = AdbClient(host=adb_host, port=adb_port)

    # ── Connection ────────────────────────────────────────────────────────

    def connect(self) -> bool:
        print(f"  Connecting to {self.ip}:{self.port} …")
        self._ensure_adb_server()
        try:
            self._client.remote_connect(self.ip, self.port)
            time.sleep(1)
            target = f"{self.ip}:{self.port}"
            for d in self._client.devices():
                if d.serial == target:
                    self.device = d
                    print(f"  Connected  →  {d.serial}")
                    return True
            print("  Device not found. Check IP and that Network Debugging is ON.")
            return False
        except Exception as e:
            print(f"  Connection failed: {e}")
            return False

    def disconnect(self):
        if self.device:
            try:
                self._client.remote_disconnect(self.ip, self.port)
            except Exception:
                pass
        print("  Disconnected.")

    @staticmethod
    def _ensure_adb_server():
        try:
            subprocess.run(["adb", "start-server"],
                           capture_output=True, timeout=5)
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass  # adb not on PATH; ppadb may still reach a running server

    # ── Shell & input ─────────────────────────────────────────────────────

    def shell(self, cmd: str) -> str:
        if not self.device:
            raise RuntimeError("Not connected")
        return self.device.shell(cmd)

    def key(self, keycode):
        code = KEYCODES.get(str(keycode).lower(), keycode)
        self.shell(f"input keyevent {code}")

    def tap(self, x: int, y: int):
        self.shell(f"input tap {x} {y}")

    def swipe(self, x1: int, y1: int, x2: int, y2: int, duration_ms: int = 300):
        self.shell(f"input swipe {x1} {y1} {x2} {y2} {duration_ms}")

    def text(self, txt: str):
        safe = txt.replace(" ", "%s")
        self.shell(f"input text {safe}")

    # ── Volume helpers ────────────────────────────────────────────────────

    def volume_up(self, steps: int = 1):
        for _ in range(steps):
            self.key("vol_up")
            time.sleep(0.15)

    def volume_down(self, steps: int = 1):
        for _ in range(steps):
            self.key("vol_down")
            time.sleep(0.15)

    def volume_set_stream(self, level: int):
        """
        Set media volume directly via AudioManager shell command (Android 9+).
        level: 0-15 for most devices.
        """
        self.shell(f"media volume --stream 3 --set {level}")
        print(f"  Volume set to {level}")

    def volume_simulate_longpress(self, direction: str, steps: int = 5):
        """
        Workaround for Projectivy accessibility service blocking volume long-press.
        Sends rapid repeated key events instead.
        direction: 'up' or 'down'
        """
        code = KEYCODES["vol_up"] if direction == "up" else KEYCODES["vol_down"]
        for _ in range(steps):
            self.shell(f"input keyevent {code}")
            time.sleep(0.08)
        print(f"  Volume {direction} × {steps} steps")

    # ── Projectivy fixes ──────────────────────────────────────────────────

    def projectivy_disable_keypress_interception(self):
        """
        Disable Projectivy accessibility keypress interception via ADB.
        Fixes volume long-press issue (workaround when UI toggle is missing).
        Ref: XDA Forums Projectivy thread
        """
        pkg = COMMON_PACKAGES["projectivy"]
        # Try to set the shared pref via content provider
        result = self.shell(
            f"am broadcast -a {pkg}.ACTION_DISABLE_KEY_INTERCEPT "
            f"-n {pkg}/.receiver.SettingsReceiver"
        )
        print(f"  Broadcast result: {result.strip()}")

    def projectivy_disable_accessibility(self):
        """
        Fully disable Projectivy accessibility service.
        Restores volume long-press at the cost of home-button override.
        """
        result = self.shell(
            "settings put secure enabled_accessibility_services :"
        )
        print("  Accessibility services cleared.")
        print("  Volume long-press should now work. Reopen Projectivy to verify.")
        return result

    def projectivy_enable_accessibility(self):
        """Re-enable Projectivy as the accessibility service."""
        pkg = COMMON_PACKAGES["projectivy"]
        svc = f"{pkg}/.service.ProjectivyAccessibilityService"
        result = self.shell(
            f"settings put secure enabled_accessibility_services {svc}"
        )
        self.shell("settings put secure accessibility_enabled 1")
        print(f"  Projectivy accessibility re-enabled: {svc}")
        return result

    def projectivy_status(self):
        """Show current accessibility services and Projectivy prefs."""
        svcs = self.shell("settings get secure enabled_accessibility_services").strip()
        enabled = self.shell("settings get secure accessibility_enabled").strip()
        print(f"  accessibility_enabled       : {enabled}")
        print(f"  enabled_accessibility_services: {svcs}")

    # ── App management ────────────────────────────────────────────────────

    def launch_app(self, package: str):
        resolved = COMMON_PACKAGES.get(package.lower(), package)
        self.shell(f"monkey -p {resolved} -c android.intent.category.LAUNCHER 1")

    def stop_app(self, package: str):
        resolved = COMMON_PACKAGES.get(package.lower(), package)
        self.shell(f"am force-stop {resolved}")

    def screenshot(self, local_path: str = "tv_screenshot.png"):
        self.shell("screencap -p /sdcard/screenshot.png")
        self.device.pull("/sdcard/screenshot.png", local_path)
        self.shell("rm /sdcard/screenshot.png")
        print(f"  Screenshot saved → {local_path}")

    def get_current_app(self) -> str:
        return self.shell("dumpsys window windows | grep -E 'mCurrentFocus'").strip()

    def list_installed_apps(self) -> list[str]:
        out = self.shell("pm list packages")
        return sorted(line.replace("package:", "").strip()
                      for line in out.splitlines() if line.strip())

    def get_device_info(self) -> dict:
        return {
            "model":        self.shell("getprop ro.product.model").strip(),
            "android":      self.shell("getprop ro.build.version.release").strip(),
            "sdk":          self.shell("getprop ro.build.version.sdk").strip(),
            "manufacturer": self.shell("getprop ro.product.manufacturer").strip(),
            "ip":           self.shell("ifconfig wlan0 2>/dev/null | grep 'inet addr' || ip addr show wlan0 2>/dev/null | grep 'inet '").strip(),
        }


# ── REPL ─────────────────────────────────────────────────────────────────────

HELP = """
  NAVIGATION
    key <name|code>         home, back, up, down, left, right, enter, menu, search
    tap <x> <y>             tap screen coordinate
    swipe <x1 y1 x2 y2>    swipe gesture  [duration_ms optional]
    text <string>           type text

  VOLUME
    vol up [n]              volume up n steps (default 1)
    vol down [n]            volume down n steps (default 1)
    vol set <0-15>          set volume directly (bypasses accessibility)
    vol longpress up [n]    rapid-tap workaround for Projectivy long-press block
    vol longpress down [n]  same, direction down

  APPS
    launch <pkg|alias>      launch app  (aliases: youtube netflix prime disney plex kodi)
    stop <pkg|alias>        force-stop app
    apps                    list all installed packages
    current                 show focused app
    youtube / netflix / prime / disney / plex / kodi / spotify

  PROJECTIVY FIX  (volume long-press broken)
    projectivy status       show accessibility service state
    projectivy disablekey   send broadcast to disable keypress interception
    projectivy off          fully disable accessibility service → fixes volume
    projectivy on           re-enable Projectivy accessibility service

  SYSTEM
    info                    device info
    screenshot [path]       save screenshot locally
    shell <cmd>             raw adb shell command
    help                    this help
    quit / exit             disconnect and exit
"""


def repl(tv: AndroidTV):
    setup_readline()
    print(HELP)

    while True:
        try:
            line = input("\033[1;36mtv>\033[0m ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not line:
            continue

        parts = line.split()
        cmd  = parts[0].lower()
        rest = parts[1:]

        try:
            # ── quit ──────────────────────────────────────────────────
            if cmd in ("quit", "exit"):
                break

            # ── help ──────────────────────────────────────────────────
            elif cmd == "help":
                print(HELP)

            # ── info ──────────────────────────────────────────────────
            elif cmd == "info":
                info = tv.get_device_info()
                for k, v in info.items():
                    print(f"  {k:14} {v}")

            # ── key ───────────────────────────────────────────────────
            elif cmd == "key":
                if not rest:
                    print("  Usage: key <name|code>")
                else:
                    tv.key(rest[0])

            # ── tap ───────────────────────────────────────────────────
            elif cmd == "tap":
                tv.tap(int(rest[0]), int(rest[1]))

            # ── swipe ─────────────────────────────────────────────────
            elif cmd == "swipe":
                args = list(map(int, rest))
                tv.swipe(*args)

            # ── text ──────────────────────────────────────────────────
            elif cmd == "text":
                tv.text(" ".join(rest))

            # ── vol ───────────────────────────────────────────────────
            elif cmd == "vol":
                if not rest:
                    print("  Usage: vol up|down [n] | vol set <n> | vol longpress up|down [n]")
                elif rest[0] == "up":
                    tv.volume_up(int(rest[1]) if len(rest) > 1 else 1)
                elif rest[0] == "down":
                    tv.volume_down(int(rest[1]) if len(rest) > 1 else 1)
                elif rest[0] == "set":
                    tv.volume_set_stream(int(rest[1]))
                elif rest[0] == "longpress" and len(rest) >= 2:
                    direction = rest[1]
                    steps = int(rest[2]) if len(rest) > 2 else 5
                    tv.volume_simulate_longpress(direction, steps)
                else:
                    print("  Unknown vol sub-command.")

            # ── projectivy ────────────────────────────────────────────
            elif cmd == "projectivy":
                sub = rest[0].lower() if rest else ""
                if sub == "status":
                    tv.projectivy_status()
                elif sub == "disablekey":
                    tv.projectivy_disable_keypress_interception()
                elif sub == "off":
                    tv.projectivy_disable_accessibility()
                elif sub == "on":
                    tv.projectivy_enable_accessibility()
                else:
                    print("  Usage: projectivy status|disablekey|off|on")

            # ── apps ──────────────────────────────────────────────────
            elif cmd == "apps":
                for pkg in tv.list_installed_apps():
                    print(f"  {pkg}")

            elif cmd == "current":
                print(f"  {tv.get_current_app()}")

            elif cmd == "screenshot":
                tv.screenshot(rest[0] if rest else "tv_screenshot.png")

            # ── app shortcuts ─────────────────────────────────────────
            elif cmd in COMMON_PACKAGES:
                tv.launch_app(cmd)

            elif cmd == "launch":
                tv.launch_app(rest[0] if rest else "")

            elif cmd == "stop":
                tv.stop_app(rest[0] if rest else "")

            # ── raw shell ─────────────────────────────────────────────
            elif cmd == "shell":
                print(tv.shell(" ".join(rest)))

            else:
                print(f"  Unknown command: {cmd}  (type 'help')")

        except (IndexError, ValueError):
            print("  Wrong arguments — type 'help' for usage.")
        except Exception as e:
            print(f"  Error: {e}")

    tv.disconnect()


# ── Entry point ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Android TV ADB Controller")
    parser.add_argument("--ip",       default=DEFAULT_TV_IP,
                        help=f"TV IP address (default: {DEFAULT_TV_IP})")
    parser.add_argument("--port",     type=int, default=DEFAULT_TV_PORT,
                        help=f"ADB port (default: {DEFAULT_TV_PORT})")
    parser.add_argument("--adb-host", default="127.0.0.1")
    parser.add_argument("--adb-port", type=int, default=5037)
    args = parser.parse_args()

    print(f"\n  Android TV ADB Console")
    print(f"  Target: {args.ip}:{args.port}\n")

    tv = AndroidTV(args.ip, args.port, args.adb_host, args.adb_port)
    if not tv.connect():
        sys.exit(1)

    info = tv.get_device_info()
    print(f"\n  {info['manufacturer']} {info['model']}  "
          f"(Android {info['android']}, SDK {info['sdk']})\n")

    repl(tv)


if __name__ == "__main__":
    main()
