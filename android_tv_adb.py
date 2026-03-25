#!/usr/bin/env python3
"""
Android TV ADB Controller
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Requirements:
    pip install pure-python-adb

Usage:
    python android_tv_adb.py                   # connects to 192.168.1.115:5555
    python android_tv_adb.py --ip 192.168.1.X

What it can do (type 'help' after connecting):
    • Full first-time setup  (launcher + screensaver + volume fix + ADB safety)
    • Disable Google TV launcher → make Projectivy the permanent default
    • Set Aerial Dream as the default screensaver
    • Fix Projectivy volume long-press issue
    • Keep ADB always reachable (your factory-reset-proof safety net)
    • Emergency recovery if the screen goes blank / launcher disappears
"""

import argparse
import subprocess
import sys
import time
import readline

try:
    from ppadb.client import Client as AdbClient
except ImportError:
    print("\n  Missing dependency.  Run:  pip install pure-python-adb\n")
    sys.exit(1)

# ── Defaults ─────────────────────────────────────────────────────────────────

DEFAULT_IP   = "192.168.1.115"
DEFAULT_PORT = 5555

# ── Package / component names ─────────────────────────────────────────────────

PKG = {
    # Launchers
    "google_tv":        "com.google.android.apps.tv.launcherx",
    "google_tv_setup":  "com.google.android.tungsten.setupwraith",   # re-enables launcher on reboot - must also be disabled
    "android_tv":       "com.google.android.tvlauncher",             # older Android TV launcher
    "projectivy":       "com.spocky.projengmenu",

    # Screensavers
    "aerial_dream":     "com.codingbuffalo.aerialdream",
    "aerial_views":     "com.neilturner.aerialviews",                # alternative aerial app
    "google_backdrop":  "com.google.android.apps.tv.dreamx",

    # Streaming
    "youtube":   "com.google.android.youtube.tv",
    "netflix":   "com.netflix.ninja",
    "prime":     "com.amazon.amazonvideo.livingroom",
    "disney":    "com.disney.disneyplus",
    "plex":      "com.plexapp.android",
    "kodi":      "org.xbmc.kodi",
    "spotify":   "com.spotify.tv.android",
}

AERIAL_DREAM_COMPONENT  = "com.codingbuffalo.aerialdream/.ui.screensaver.DreamActivity"
AERIAL_VIEWS_COMPONENT  = "com.neilturner.aerialviews/.ui.screensaver.DreamService"
GOOGLE_BACKDROP_COMPONENT = "com.google.android.apps.tv.dreamx/.service.Backdrop"

KEYCODES = {
    "home": 3, "back": 4, "up": 19, "down": 20, "left": 21, "right": 22,
    "enter": 66, "ok": 66, "play_pause": 85, "play": 126, "pause": 127,
    "stop": 86, "next": 87, "prev": 88, "vol_up": 24, "vol_down": 25,
    "mute": 164, "power": 26, "menu": 82, "search": 84, "sleep": 223,
}

ALL_COMMANDS = [
    "setup", "recover", "info",
    "launcher", "screensaver", "volfix", "adbsafe",
    "key", "tap", "swipe", "text", "vol",
    "apps", "current", "screenshot", "shell",
    "youtube", "netflix", "prime", "disney", "plex", "kodi",
    "help", "quit", "exit",
]

# ── Colours ───────────────────────────────────────────────────────────────────

G  = "\033[1;32m"   # green
Y  = "\033[1;33m"   # yellow
R  = "\033[1;31m"   # red
C  = "\033[1;36m"   # cyan
W  = "\033[0m"      # reset

def ok(msg):    print(f"  {G}✔{W}  {msg}")
def warn(msg):  print(f"  {Y}⚠{W}  {msg}")
def err(msg):   print(f"  {R}✘{W}  {msg}")
def info(msg):  print(f"  {C}→{W}  {msg}")

# ── AndroidTV class ───────────────────────────────────────────────────────────

class AndroidTV:
    def __init__(self, ip, port=DEFAULT_PORT, adb_host="127.0.0.1", adb_port=5037):
        self.ip   = ip
        self.port = port
        self._client = AdbClient(host=adb_host, port=adb_port)
        self.device  = None

    # ── Connection ────────────────────────────────────────────────────────

    def connect(self) -> bool:
        info(f"Connecting to {self.ip}:{self.port} …")
        self._start_adb_server()
        try:
            self._client.remote_connect(self.ip, self.port)
            time.sleep(1.5)
            target = f"{self.ip}:{self.port}"
            for d in self._client.devices():
                if d.serial == target:
                    self.device = d
                    ok(f"Connected  →  {d.serial}")
                    return True
            err("Device not found. Check:")
            print("     1. TV and laptop are on the same WiFi")
            print("     2. Network Debugging is ON  (Settings → Developer Options)")
            print("     3. You approved the ADB dialog on the TV")
            return False
        except Exception as e:
            err(f"Connection error: {e}")
            return False

    def disconnect(self):
        try:
            self._client.remote_disconnect(self.ip, self.port)
        except Exception:
            pass
        info("Disconnected.")

    @staticmethod
    def _start_adb_server():
        try:
            subprocess.run(["adb", "start-server"], capture_output=True, timeout=5)
        except Exception:
            pass

    # ── Raw shell ─────────────────────────────────────────────────────────

    def sh(self, cmd: str, silent=False) -> str:
        if not self.device:
            raise RuntimeError("Not connected")
        result = self.device.shell(cmd)
        if not silent:
            return result
        return result

    # ── Input helpers ─────────────────────────────────────────────────────

    def key(self, keycode):
        code = KEYCODES.get(str(keycode).lower(), keycode)
        self.sh(f"input keyevent {code}", silent=True)

    def tap(self, x, y):
        self.sh(f"input tap {x} {y}", silent=True)

    def swipe(self, x1, y1, x2, y2, ms=300):
        self.sh(f"input swipe {x1} {y1} {x2} {y2} {ms}", silent=True)

    def text(self, txt: str):
        self.sh(f"input text {txt.replace(' ', '%s')}", silent=True)

    # ── Volume ────────────────────────────────────────────────────────────

    def volume_up(self, steps=1):
        for _ in range(steps):
            self.key("vol_up")
            time.sleep(0.12)

    def volume_down(self, steps=1):
        for _ in range(steps):
            self.key("vol_down")
            time.sleep(0.12)

    def volume_set(self, level: int):
        """Set media stream volume directly (bypasses accessibility service)."""
        self.sh(f"media volume --stream 3 --set {level}", silent=True)
        ok(f"Volume set to {level}")

    def volume_longpress_workaround(self, direction: str, steps=5):
        """
        Rapid-tap workaround for Projectivy blocking volume long-press.
        Sends quick repeated key events to simulate held volume key.
        """
        code = KEYCODES["vol_up"] if direction == "up" else KEYCODES["vol_down"]
        for _ in range(steps):
            self.sh(f"input keyevent {code}", silent=True)
            time.sleep(0.07)
        ok(f"Volume {direction} × {steps} rapid steps")

    # ── Launcher management ───────────────────────────────────────────────

    def disable_google_tv_launcher(self):
        """
        Disable Google TV launcher and the setup wrapper that re-enables it.
        Pressing Home after this will prompt you to choose a default launcher.
        Safe: can be undone with launcher restore command.
        """
        info("Disabling Google TV launcher …")
        # Disable main launcher
        r1 = self.sh(f"pm disable-user --user 0 {PKG['google_tv']}")
        # Disable setup wrapper (prevents auto-re-enabling the launcher on reboot)
        r2 = self.sh(f"pm disable-user --user 0 {PKG['google_tv_setup']}")
        # Also try the older Android TV launcher package name
        r3 = self.sh(f"pm disable-user --user 0 {PKG['android_tv']}")

        if "disabled" in r1.lower() or "already" in r1.lower():
            ok(f"Google TV launcher disabled")
        else:
            warn(f"launcherx result: {r1.strip()}")

        if "disabled" in r2.lower() or "already" in r2.lower():
            ok(f"Setup wrapper (setupwraith) disabled — prevents auto re-enable")
        else:
            warn(f"setupwraith result: {r2.strip()}")

        print()
        info("Now press HOME on your remote — you'll be prompted to pick a launcher.")
        info("Choose Projectivy and select 'Always'.")

    def restore_google_tv_launcher(self):
        """Re-enable Google TV launcher (recovery / undo)."""
        info("Re-enabling Google TV launcher …")
        self.sh(f"pm enable {PKG['google_tv']}")
        self.sh(f"pm enable {PKG['google_tv_setup']}")
        self.sh(f"pm enable {PKG['android_tv']}")
        ok("Google TV launcher re-enabled.")
        info("Press HOME — Google TV should return.")

    def set_home_app(self, package=None):
        """Force-set a package as the home/launcher app via role manager."""
        pkg = package or PKG["projectivy"]
        info(f"Setting home app → {pkg}")
        result = self.sh(f"cmd role set-role-holder android.app.role.HOME {pkg} 0")
        if result.strip() == "" or "success" in result.lower():
            ok(f"Home app set to {pkg}")
        else:
            warn(f"Result: {result.strip()}")
            info("If this didn't work, press HOME and manually select Projectivy.")

    def grant_widget_permission(self, package=None):
        pkg = package or PKG["projectivy"]
        self.sh(f"appwidget grantbind --package {pkg} --user 0", silent=True)
        ok(f"Widget binding granted to {pkg}")

    # ── Screensaver ───────────────────────────────────────────────────────

    def set_screensaver_aerial_dream(self):
        """
        Set Aerial Dream as the default screensaver (daydream).
        Checks which Aerial app is installed and uses the right component.
        """
        info("Detecting which Aerial screensaver app is installed …")
        installed = self.sh("pm list packages", silent=True)

        if PKG["aerial_dream"] in installed:
            component = AERIAL_DREAM_COMPONENT
            app_name  = "Aerial Dream"
        elif PKG["aerial_views"] in installed:
            component = AERIAL_VIEWS_COMPONENT
            app_name  = "Aerial Views"
        else:
            err("Aerial Dream / Aerial Views not found on your TV.")
            info(f"Install one from Play Store:")
            info(f"  Aerial Dream  →  package: {PKG['aerial_dream']}")
            info(f"  Aerial Views  →  package: {PKG['aerial_views']}")
            return

        info(f"Setting {app_name} ({component}) as default screensaver …")
        self.sh(f"settings put secure screensaver_components {component}", silent=True)
        self.sh(f"settings put secure screensaver_default_component {component}", silent=True)
        self.sh("settings put secure screensaver_enabled 1", silent=True)
        self.sh("settings put global screensaver_activate_on_sleep 1", silent=True)
        self.sh("settings put global screensaver_activate_on_dock 1", silent=True)
        ok(f"{app_name} set as default screensaver")

    def get_screensaver_info(self):
        current   = self.sh("settings get secure screensaver_components").strip()
        enabled   = self.sh("settings get secure screensaver_enabled").strip()
        on_sleep  = self.sh("settings get global screensaver_activate_on_sleep").strip()
        print(f"  screensaver_enabled          : {enabled}")
        print(f"  screensaver_components       : {current}")
        print(f"  activate_on_sleep            : {on_sleep}")

    def restore_google_screensaver(self):
        self.sh(f"settings put secure screensaver_components {GOOGLE_BACKDROP_COMPONENT}", silent=True)
        ok("Restored Google Backdrop screensaver")

    def start_screensaver_now(self):
        self.sh("am start -n com.android.systemui/.Somnambulator", silent=True)
        ok("Screensaver started")

    # ── Projectivy volume fix ─────────────────────────────────────────────

    def volfix_status(self):
        svcs    = self.sh("settings get secure enabled_accessibility_services").strip()
        enabled = self.sh("settings get secure accessibility_enabled").strip()
        print(f"  accessibility_enabled            : {enabled}")
        print(f"  enabled_accessibility_services   : {svcs}")
        if PKG["projectivy"] in svcs:
            warn("Projectivy accessibility service is ACTIVE")
            warn("This intercepts volume keys → long-press broken")
            info("Run 'volfix off' to fix, or 'volfix keyoff' to disable only key interception")
        else:
            ok("Projectivy accessibility NOT in services — volume should work fine")

    def volfix_disable_keypress_interception(self):
        """Broadcast to Projectivy to disable keypress interception only."""
        pkg = PKG["projectivy"]
        result = self.sh(
            f"am broadcast -a {pkg}.ACTION_DISABLE_KEY_INTERCEPT "
            f"-n {pkg}/.receiver.SettingsReceiver"
        )
        info(f"Broadcast result: {result.strip()}")
        info("If no effect, use 'volfix off' to fully disable accessibility service.")

    def volfix_disable_accessibility(self):
        """
        Fully remove Projectivy from accessibility services.
        Restores volume long-press completely.
        Cost: Home button override won't work (use Launcher Manager instead).
        """
        self.sh("settings put secure enabled_accessibility_services :", silent=True)
        ok("Accessibility services cleared")
        ok("Volume long-press restored")
        warn("Home button override is now disabled")
        info("Projectivy still runs as your default launcher via pm disable method")

    def volfix_reenable_accessibility(self):
        pkg = PKG["projectivy"]
        svc = f"{pkg}/.service.ProjectivyAccessibilityService"
        self.sh(f"settings put secure enabled_accessibility_services {svc}", silent=True)
        self.sh("settings put secure accessibility_enabled 1", silent=True)
        ok(f"Projectivy accessibility re-enabled")

    # ── ADB safety net ────────────────────────────────────────────────────

    def adbsafe_status(self):
        """Check if ADB over network will survive a reboot."""
        tcp_port  = self.sh("getprop service.adb.tcp.port").strip()
        net_debug = self.sh("settings get global adb_wifi_enabled").strip()
        print(f"  service.adb.tcp.port   : {tcp_port  or '(not set)'}")
        print(f"  adb_wifi_enabled       : {net_debug or '(not set)'}")
        if tcp_port == "5555":
            ok("ADB TCP port is active this session")
        else:
            warn("ADB TCP port not currently set — you may not reconnect after reboot")
        info("Note: Without root, ADB TCP must be re-enabled via Network Debugging in Developer Options after each cold reboot.")
        info("Make sure 'Network Debugging' is ON in Settings → Developer Options — this is the most reliable no-root method.")

    def adbsafe_enable_tcp(self):
        """Ensure ADB listens on TCP 5555 right now."""
        self.sh("setprop service.adb.tcp.port 5555", silent=True)
        self.sh("stop adbd", silent=True)
        time.sleep(1)
        self.sh("start adbd", silent=True)
        ok("ADB TCP port set to 5555 for this session")
        warn("This resets on cold reboot. Keep 'Network Debugging' ON in Developer Options.")

    def adbsafe_check_network_debug(self):
        """Verify Network Debugging developer option is persistently enabled."""
        result = self.sh("settings get global development_settings_enabled").strip()
        adb_en = self.sh("settings get global adb_enabled").strip()
        info(f"Developer settings enabled : {result}")
        info(f"ADB enabled                : {adb_en}")
        if result == "1" and adb_en == "1":
            ok("Developer mode + ADB are ON")
        else:
            warn("Developer mode or ADB may be off — re-enable in Settings → Developer Options")

    # ── Full setup ────────────────────────────────────────────────────────

    def full_setup(self):
        """
        One-shot first-time setup:
          1. Verify ADB safety net
          2. Disable Google TV launcher → Projectivy becomes default
          3. Fix Projectivy volume long-press
          4. Set Aerial Dream as screensaver
          5. Grant Projectivy widget permission
        """
        print()
        print(f"  {C}━━━ FULL SETUP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}")
        print()

        # Step 1 — ADB safety
        print(f"  {Y}[1/5]{W} ADB Safety Net")
        self.adbsafe_check_network_debug()
        print()

        # Step 2 — Launcher
        print(f"  {Y}[2/5]{W} Disable Google TV Launcher")
        self.disable_google_tv_launcher()
        print()
        time.sleep(1)
        print(f"  {Y}[2b]{W}  Setting Projectivy as home app via role manager …")
        self.set_home_app()
        self.grant_widget_permission()
        print()

        # Step 3 — Volume fix
        print(f"  {Y}[3/5]{W} Projectivy Volume Long-Press Fix")
        self.volfix_disable_accessibility()
        print()

        # Step 4 — Screensaver
        print(f"  {Y}[4/5]{W} Aerial Dream Screensaver")
        self.set_screensaver_aerial_dream()
        print()

        # Step 5 — Done
        print(f"  {Y}[5/5]{W} Summary")
        ok("Launcher : Google TV disabled, Projectivy is default home")
        ok("Volume   : Long-press restored (accessibility service off)")
        ok("Saver    : Aerial Dream set as screensaver")
        ok("ADB      : Connected on 5555 — keep 'Network Debugging' ON in Dev Options")
        print()
        warn("IMPORTANT: Press HOME on your remote now.")
        warn("If prompted, select Projectivy and tap 'Always'.")
        print()
        print(f"  {C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}")
        print()

    # ── Emergency recovery ────────────────────────────────────────────────

    def recover(self):
        """
        Emergency recovery — screen blank / launcher gone / stuck.
        Restores Google TV launcher and re-enables accessibility.
        Run this any time you're locked out.
        """
        print()
        print(f"  {R}━━━ EMERGENCY RECOVERY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}")
        print()
        info("Step 1: Re-enabling Google TV launcher …")
        self.restore_google_tv_launcher()
        print()
        info("Step 2: Launching Google TV home …")
        self.sh(
            f"am start -n {PKG['google_tv']}/.GtvHomeActivity "
            "--activity-clear-task", silent=True
        )
        time.sleep(2)
        self.key("home")
        print()
        info("Step 3: Re-enabling ADB TCP …")
        self.adbsafe_enable_tcp()
        print()
        ok("Recovery complete. Google TV should be back on screen.")
        info("From here you can re-run 'setup' when ready.")
        print()
        print(f"  {R}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}")
        print()

    # ── Device info ───────────────────────────────────────────────────────

    def device_info(self):
        return {
            "model":        self.sh("getprop ro.product.model").strip(),
            "manufacturer": self.sh("getprop ro.product.manufacturer").strip(),
            "android":      self.sh("getprop ro.build.version.release").strip(),
            "sdk":          self.sh("getprop ro.build.version.sdk").strip(),
            "ip":           self._get_ip(),
        }

    def _get_ip(self):
        r = self.sh("ip addr show wlan0 2>/dev/null | grep 'inet '").strip()
        if r:
            return r.split()[1]
        return self.sh("ifconfig wlan0 2>/dev/null | grep 'inet addr'").strip()

    def get_current_app(self):
        return self.sh("dumpsys window windows | grep -E 'mCurrentFocus'").strip()

    def list_installed_apps(self):
        out = self.sh("pm list packages")
        return sorted(l.replace("package:", "").strip() for l in out.splitlines() if l.strip())

    def screenshot(self, path="tv_screenshot.png"):
        self.sh("screencap -p /sdcard/screenshot.png", silent=True)
        self.device.pull("/sdcard/screenshot.png", path)
        self.sh("rm /sdcard/screenshot.png", silent=True)
        ok(f"Screenshot saved → {path}")

    def launch_app(self, pkg_alias: str):
        pkg = PKG.get(pkg_alias.lower(), pkg_alias)
        self.sh(f"monkey -p {pkg} -c android.intent.category.LAUNCHER 1", silent=True)

    def stop_app(self, pkg_alias: str):
        pkg = PKG.get(pkg_alias.lower(), pkg_alias)
        self.sh(f"am force-stop {pkg}", silent=True)


# ── REPL ─────────────────────────────────────────────────────────────────────

HELP_TEXT = f"""
{C}━━━ COMMANDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}

  {Y}QUICK START{W}
    setup                       Full first-time setup (launcher + vol + screensaver + ADB)
    recover                     Emergency recovery — restores Google TV if screen is blank

  {Y}LAUNCHER{W}
    launcher disable            Disable Google TV launcher → makes Projectivy default
    launcher restore            Re-enable Google TV launcher
    launcher sethome            Set Projectivy as home via role manager
    launcher widget             Grant Projectivy widget binding permission

  {Y}SCREENSAVER{W}
    screensaver set             Set Aerial Dream as default screensaver
    screensaver info            Show current screensaver settings
    screensaver restore         Restore Google Backdrop screensaver
    screensaver start           Start screensaver right now (preview)

  {Y}VOLUME FIX  (Projectivy long-press broken){W}
    volfix status               Show accessibility service state
    volfix off                  Disable accessibility → fully fixes volume long-press
    volfix keyoff               Broadcast to disable key interception only
    volfix on                   Re-enable Projectivy accessibility service
    vol up [n]                  Volume up n steps
    vol down [n]                Volume down n steps
    vol set <0-15>              Set volume directly (bypasses accessibility)
    vol lp up [n]               Rapid-tap long-press workaround (default 5 steps)
    vol lp down [n]             Same, downward

  {Y}ADB SAFETY NET{W}
    adbsafe status              Check ADB TCP state and Developer Options
    adbsafe tcp                 Enable ADB TCP 5555 right now
    adbsafe netdebug            Check Network Debugging setting

  {Y}REMOTE CONTROL{W}
    key <name|code>             home back up down left right enter play_pause
                                vol_up vol_down mute power menu search
    tap <x> <y>                 Tap screen coordinate
    swipe <x1 y1 x2 y2> [ms]   Swipe gesture
    text <string>               Type text

  {Y}APPS{W}
    launch <pkg|alias>          Launch app  (aliases: youtube netflix prime disney plex kodi)
    stop <pkg|alias>            Force-stop app
    apps                        List all installed packages
    current                     Show focused app
    youtube / netflix / prime / disney / plex / kodi

  {Y}SYSTEM{W}
    info                        Device info
    screenshot [path]           Save screenshot locally
    shell <cmd>                 Raw adb shell command
    help                        This help
    quit / exit                 Disconnect and exit
{C}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{W}
"""

def _tab_complete(text, state):
    options = [c for c in ALL_COMMANDS if c.startswith(text)]
    return options[state] if state < len(options) else None

def repl(tv: AndroidTV):
    readline.set_completer(_tab_complete)
    readline.parse_and_bind("tab: complete")
    print(HELP_TEXT)

    while True:
        try:
            line = input(f"\n{C}tv ›{W} ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not line:
            continue

        parts = line.split()
        cmd   = parts[0].lower()
        rest  = parts[1:]

        try:
            # ── quit ──────────────────────────────────────────────────────
            if cmd in ("quit", "exit"):
                break

            elif cmd == "help":
                print(HELP_TEXT)

            # ── setup / recover ───────────────────────────────────────────
            elif cmd == "setup":
                tv.full_setup()

            elif cmd == "recover":
                tv.recover()

            # ── info ──────────────────────────────────────────────────────
            elif cmd == "info":
                d = tv.device_info()
                for k, v in d.items():
                    print(f"  {k:14} {v}")

            # ── launcher ──────────────────────────────────────────────────
            elif cmd == "launcher":
                sub = rest[0].lower() if rest else ""
                if sub == "disable":
                    tv.disable_google_tv_launcher()
                elif sub == "restore":
                    tv.restore_google_tv_launcher()
                elif sub == "sethome":
                    tv.set_home_app()
                elif sub == "widget":
                    tv.grant_widget_permission()
                else:
                    warn("Usage: launcher disable | restore | sethome | widget")

            # ── screensaver ───────────────────────────────────────────────
            elif cmd == "screensaver":
                sub = rest[0].lower() if rest else ""
                if sub == "set":
                    tv.set_screensaver_aerial_dream()
                elif sub == "info":
                    tv.get_screensaver_info()
                elif sub == "restore":
                    tv.restore_google_screensaver()
                elif sub == "start":
                    tv.start_screensaver_now()
                else:
                    warn("Usage: screensaver set | info | restore | start")

            # ── volfix ────────────────────────────────────────────────────
            elif cmd == "volfix":
                sub = rest[0].lower() if rest else ""
                if sub == "status":
                    tv.volfix_status()
                elif sub == "off":
                    tv.volfix_disable_accessibility()
                elif sub == "keyoff":
                    tv.volfix_disable_keypress_interception()
                elif sub == "on":
                    tv.volfix_reenable_accessibility()
                else:
                    warn("Usage: volfix status | off | keyoff | on")

            # ── vol ───────────────────────────────────────────────────────
            elif cmd == "vol":
                if not rest:
                    warn("Usage: vol up|down [n] | vol set <n> | vol lp up|down [n]")
                elif rest[0] == "up":
                    tv.volume_up(int(rest[1]) if len(rest) > 1 else 1)
                elif rest[0] == "down":
                    tv.volume_down(int(rest[1]) if len(rest) > 1 else 1)
                elif rest[0] == "set":
                    tv.volume_set(int(rest[1]))
                elif rest[0] == "lp":
                    direction = rest[1] if len(rest) > 1 else "up"
                    steps = int(rest[2]) if len(rest) > 2 else 5
                    tv.volume_longpress_workaround(direction, steps)
                else:
                    warn("Unknown vol sub-command")

            # ── adbsafe ───────────────────────────────────────────────────
            elif cmd == "adbsafe":
                sub = rest[0].lower() if rest else ""
                if sub == "status":
                    tv.adbsafe_status()
                elif sub == "tcp":
                    tv.adbsafe_enable_tcp()
                elif sub == "netdebug":
                    tv.adbsafe_check_network_debug()
                else:
                    warn("Usage: adbsafe status | tcp | netdebug")

            # ── key ───────────────────────────────────────────────────────
            elif cmd == "key":
                tv.key(rest[0] if rest else "home")

            elif cmd == "tap":
                tv.tap(int(rest[0]), int(rest[1]))

            elif cmd == "swipe":
                args = list(map(int, rest))
                tv.swipe(*args)

            elif cmd == "text":
                tv.text(" ".join(rest))

            # ── apps ──────────────────────────────────────────────────────
            elif cmd == "apps":
                for p in tv.list_installed_apps():
                    print(f"  {p}")

            elif cmd == "current":
                print(f"  {tv.get_current_app()}")

            elif cmd == "screenshot":
                tv.screenshot(rest[0] if rest else "tv_screenshot.png")

            # ── app shortcuts ─────────────────────────────────────────────
            elif cmd in PKG:
                tv.launch_app(cmd)

            elif cmd == "launch":
                tv.launch_app(rest[0] if rest else "")

            elif cmd == "stop":
                tv.stop_app(rest[0] if rest else "")

            # ── raw shell ─────────────────────────────────────────────────
            elif cmd == "shell":
                out = tv.sh(" ".join(rest))
                if out.strip():
                    print(out)

            else:
                warn(f"Unknown command: {cmd}  — type 'help'")

        except (IndexError, ValueError) as e:
            warn(f"Wrong arguments ({e}) — type 'help'")
        except Exception as e:
            err(f"{e}")

    tv.disconnect()


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser(description="Android TV ADB Controller")
    p.add_argument("--ip",       default=DEFAULT_IP,
                   help=f"TV IP  (default: {DEFAULT_IP})")
    p.add_argument("--port",     type=int, default=DEFAULT_PORT)
    p.add_argument("--adb-host", default="127.0.0.1")
    p.add_argument("--adb-port", type=int, default=5037)
    args = p.parse_args()

    print(f"\n  {C}Android TV ADB Console{W}")
    print(f"  Target: {args.ip}:{args.port}\n")

    tv = AndroidTV(args.ip, args.port, args.adb_host, args.adb_port)
    if not tv.connect():
        sys.exit(1)

    d = tv.device_info()
    print(f"\n  {G}{d['manufacturer']} {d['model']}{W}  "
          f"(Android {d['android']}, SDK {d['sdk']})")
    print(f"  TV IP: {d['ip']}\n")

    repl(tv)


if __name__ == "__main__":
    main()
