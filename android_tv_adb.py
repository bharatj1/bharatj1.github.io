#!/usr/bin/env python3
"""
Android TV ADB Controller
Connects to Android TV over network (TCP/IP) and lets you send commands.

Requirements:
    pip install pure-python-adb

Usage:
    python android_tv_adb.py --ip 192.168.1.X
    python android_tv_adb.py --ip 192.168.1.X --port 5555

How to enable ADB on Android TV:
    Settings -> Device Preferences -> About -> Build (click 7 times to enable Developer Mode)
    Settings -> Device Preferences -> Developer Options -> USB Debugging ON
    Settings -> Device Preferences -> Developer Options -> Network Debugging ON
"""

import argparse
import sys
import time

try:
    from ppadb.client import Client as AdbClient
except ImportError:
    print("Install dependency: pip install pure-python-adb")
    sys.exit(1)


# Key codes for Android TV remote buttons
KEYCODES = {
    "home":       3,
    "back":       4,
    "up":         19,
    "down":       20,
    "left":       21,
    "right":      22,
    "enter":      66,
    "play_pause": 85,
    "stop":       86,
    "next":       87,
    "prev":       88,
    "vol_up":     24,
    "vol_down":   25,
    "mute":       164,
    "power":      26,
    "menu":       82,
    "search":     84,
}


class AndroidTV:
    def __init__(self, ip: str, port: int = 5555, adb_host: str = "127.0.0.1", adb_port: int = 5037):
        self.ip = ip
        self.port = port
        self.device = None
        self._client = AdbClient(host=adb_host, port=adb_port)

    def connect(self) -> bool:
        """Connect to the Android TV over TCP/IP."""
        print(f"Connecting to {self.ip}:{self.port} ...")
        try:
            self._client.remote_connect(self.ip, self.port)
            time.sleep(1)
            devices = self._client.devices()
            target = f"{self.ip}:{self.port}"
            for d in devices:
                if d.serial == target:
                    self.device = d
                    print(f"Connected: {d.serial}")
                    return True
            print("Device not found after connect — check IP and that ADB/Network Debugging is enabled on the TV.")
            return False
        except Exception as e:
            print(f"Connection failed: {e}")
            print("Make sure 'adb server' is running: run `adb start-server` in a terminal.")
            return False

    def disconnect(self):
        if self.device:
            self._client.remote_disconnect(self.ip, self.port)
            print("Disconnected.")

    def shell(self, cmd: str) -> str:
        """Run an arbitrary ADB shell command and return output."""
        if not self.device:
            raise RuntimeError("Not connected")
        return self.device.shell(cmd)

    # ── Remote control helpers ──────────────────────────────────────────────

    def key(self, keycode):
        """Send a keyevent (name from KEYCODES dict or raw int)."""
        code = KEYCODES.get(str(keycode).lower(), keycode)
        self.shell(f"input keyevent {code}")

    def tap(self, x: int, y: int):
        """Tap a screen coordinate."""
        self.shell(f"input tap {x} {y}")

    def swipe(self, x1: int, y1: int, x2: int, y2: int, duration_ms: int = 300):
        """Swipe from (x1,y1) to (x2,y2)."""
        self.shell(f"input swipe {x1} {y1} {x2} {y2} {duration_ms}")

    def text(self, txt: str):
        """Type text (spaces must be escaped as %s)."""
        safe = txt.replace(" ", "%s")
        self.shell(f"input text {safe}")

    def launch_app(self, package: str):
        """Launch an installed app by package name."""
        self.shell(f"monkey -p {package} -c android.intent.category.LAUNCHER 1")

    def stop_app(self, package: str):
        """Force-stop an app."""
        self.shell(f"am force-stop {package}")

    def screenshot(self, local_path: str = "tv_screenshot.png"):
        """Pull a screenshot to the local machine."""
        self.shell("screencap -p /sdcard/screenshot.png")
        self.device.pull("/sdcard/screenshot.png", local_path)
        self.shell("rm /sdcard/screenshot.png")
        print(f"Screenshot saved to {local_path}")

    def get_current_app(self) -> str:
        """Return the package name of the currently focused app."""
        out = self.shell("dumpsys window windows | grep -E 'mCurrentFocus'")
        return out.strip()

    def list_installed_apps(self) -> list[str]:
        """List all installed package names."""
        out = self.shell("pm list packages")
        return [line.replace("package:", "").strip() for line in out.splitlines() if line.strip()]

    def get_device_info(self) -> dict:
        """Return basic device info."""
        return {
            "model":        self.shell("getprop ro.product.model").strip(),
            "android":      self.shell("getprop ro.build.version.release").strip(),
            "sdk":          self.shell("getprop ro.build.version.sdk").strip(),
            "manufacturer": self.shell("getprop ro.product.manufacturer").strip(),
            "serial":       self.shell("getprop ro.serialno").strip(),
        }

    # ── Common streaming apps ───────────────────────────────────────────────

    def open_youtube(self):
        self.launch_app("com.google.android.youtube.tv")

    def open_netflix(self):
        self.launch_app("com.netflix.ninja")

    def open_prime_video(self):
        self.launch_app("com.amazon.amazonvideo.livingroom")

    def open_disney_plus(self):
        self.launch_app("com.disney.disneyplus")

    def open_settings(self):
        self.shell("am start -a android.settings.SETTINGS")


# ── Interactive REPL ────────────────────────────────────────────────────────

COMMANDS_HELP = """
Commands:
  info                  - Show device info
  key <name|code>       - Send keyevent  (home, back, up, down, left, right,
                          enter, play_pause, vol_up, vol_down, mute, power ...)
  tap <x> <y>           - Tap screen coordinate
  swipe <x1 y1 x2 y2>  - Swipe gesture
  text <string>         - Type text
  launch <package>      - Launch app by package name
  stop <package>        - Force-stop app
  apps                  - List installed apps
  current               - Show focused app
  screenshot [path]     - Take screenshot
  youtube               - Open YouTube
  netflix               - Open Netflix
  prime                 - Open Prime Video
  shell <cmd>           - Run raw adb shell command
  help                  - Show this help
  quit / exit           - Disconnect and exit
"""


def repl(tv: AndroidTV):
    print(COMMANDS_HELP)
    while True:
        try:
            line = input("tv> ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not line:
            continue

        parts = line.split(None, 1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""

        try:
            if cmd in ("quit", "exit"):
                break
            elif cmd == "help":
                print(COMMANDS_HELP)
            elif cmd == "info":
                info = tv.get_device_info()
                for k, v in info.items():
                    print(f"  {k:14} {v}")
            elif cmd == "key":
                tv.key(args.strip())
            elif cmd == "tap":
                x, y = map(int, args.split())
                tv.tap(x, y)
            elif cmd == "swipe":
                coords = list(map(int, args.split()))
                tv.swipe(*coords)
            elif cmd == "text":
                tv.text(args)
            elif cmd == "launch":
                tv.launch_app(args.strip())
            elif cmd == "stop":
                tv.stop_app(args.strip())
            elif cmd == "apps":
                for pkg in tv.list_installed_apps():
                    print(f"  {pkg}")
            elif cmd == "current":
                print(tv.get_current_app())
            elif cmd == "screenshot":
                path = args.strip() or "tv_screenshot.png"
                tv.screenshot(path)
            elif cmd == "youtube":
                tv.open_youtube()
            elif cmd == "netflix":
                tv.open_netflix()
            elif cmd == "prime":
                tv.open_prime_video()
            elif cmd == "shell":
                print(tv.shell(args))
            else:
                print(f"Unknown command: {cmd}  (type 'help')")
        except Exception as e:
            print(f"Error: {e}")

    tv.disconnect()


# ── Entry point ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Android TV ADB Controller")
    parser.add_argument("--ip",       required=True,  help="TV IP address (e.g. 192.168.1.50)")
    parser.add_argument("--port",     type=int, default=5555, help="ADB port on TV (default 5555)")
    parser.add_argument("--adb-host", default="127.0.0.1", help="Local ADB server host")
    parser.add_argument("--adb-port", type=int, default=5037, help="Local ADB server port")
    args = parser.parse_args()

    tv = AndroidTV(args.ip, args.port, args.adb_host, args.adb_port)
    if not tv.connect():
        sys.exit(1)

    info = tv.get_device_info()
    print(f"\nDevice : {info['manufacturer']} {info['model']}")
    print(f"Android: {info['android']}  (SDK {info['sdk']})\n")

    repl(tv)


if __name__ == "__main__":
    main()
