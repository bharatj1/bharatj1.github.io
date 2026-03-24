#!/usr/bin/env python3
"""
Fix Google TV black screen caused by disabled launcher.
Connects via ADB and re-enables the Google TV / Android TV launcher.

Usage:
    python fix_google_tv_launcher.py <TV_IP>
"""

import socket
import sys
import time
import struct


def adb_message(command, arg0=0, arg1=0, data=b""):
    cmd = command.encode() if isinstance(command, str) else command
    cmd_int = struct.unpack("<I", cmd)[0]
    data = data.encode() if isinstance(data, str) else data
    data_len = len(data)
    data_crc = sum(data) & 0xFFFFFFFF
    magic = cmd_int ^ 0xFFFFFFFF
    header = struct.pack("<IIIIII", cmd_int, arg0, arg1, data_len, data_crc, magic)
    return header + data


class RawADB:
    VERSION = 0x01000000
    MAX_PAYLOAD = 4096

    def __init__(self, ip, port=5555):
        self.ip = ip
        self.port = port
        self.sock = None

    def connect(self):
        self.sock = socket.create_connection((self.ip, self.port), timeout=10)
        self.sock.settimeout(10)
        # Send CNXN
        banner = b"host::features=shell_v2,cmd\x00"
        msg = adb_message("CNXN", self.VERSION, self.MAX_PAYLOAD, banner)
        self.sock.sendall(msg)
        # Read response
        resp = self._read_header()
        if resp is None:
            raise RuntimeError("No response from device")
        cmd = struct.pack("<I", resp[0])
        if cmd == b"AUTH":
            raise RuntimeError(
                "Device requires RSA auth. Accept the 'Allow USB debugging' popup on screen first, then retry."
            )
        if cmd != b"CNXN":
            raise RuntimeError(f"Unexpected response: {cmd}")
        print(f"Connected to {self.ip}:{self.port}")
        return True

    def _read_header(self):
        try:
            data = self._recv_exact(24)
            if not data:
                return None
            return struct.unpack("<IIIIII", data)
        except socket.timeout:
            return None

    def _recv_exact(self, n):
        buf = b""
        while len(buf) < n:
            chunk = self.sock.recv(n - len(buf))
            if not chunk:
                return None
            buf += chunk
        return buf

    def shell(self, command):
        """Send a shell command and return output."""
        # Open stream
        local_id = 1
        cmd_data = f"shell:{command}\x00".encode()
        open_msg = adb_message("OPEN", local_id, 0, cmd_data)
        self.sock.sendall(open_msg)

        output = []
        remote_id = None
        while True:
            hdr = self._read_header()
            if hdr is None:
                break
            cmd = struct.pack("<I", hdr[0])
            arg0, arg1, data_len = hdr[1], hdr[2], hdr[3]

            payload = b""
            if data_len > 0:
                payload = self._recv_exact(data_len) or b""

            if cmd == b"OKAY":
                remote_id = arg0
                # Send OKAY back
                okay = adb_message("OKAY", local_id, remote_id)
                self.sock.sendall(okay)
            elif cmd == b"WRTE":
                output.append(payload.decode(errors="replace"))
                okay = adb_message("OKAY", local_id, remote_id)
                self.sock.sendall(okay)
            elif cmd == b"CLSE":
                break
        return "".join(output)

    def close(self):
        if self.sock:
            self.sock.close()


LAUNCHERS = [
    "com.google.android.apps.tv.launcherx",   # Google TV launcher (newer)
    "com.google.android.tvlauncher",           # Android TV launcher (older)
    "com.android.tv.settings",                # fallback: at least open settings
]


def fix(ip):
    adb = RawADB(ip)
    try:
        adb.connect()
    except Exception as e:
        print(f"Could not connect: {e}")
        sys.exit(1)

    print("\nChecking disabled packages...")
    disabled = adb.shell("pm list packages -d")
    print(disabled or "(none disabled)")

    fixed = False
    for pkg in LAUNCHERS:
        if pkg in disabled:
            print(f"\nRe-enabling {pkg} ...")
            result = adb.shell(f"pm enable {pkg}")
            print(result)
            fixed = True

    if fixed:
        print("\nSetting home activity...")
        for pkg in LAUNCHERS[:2]:
            if pkg in disabled:
                adb.shell(f"cmd package set-home-activity {pkg}/.MainActivity")

        print("Restarting launcher...")
        adb.shell("am start -n com.google.android.apps.tv.launcherx/.MainActivity")
        adb.shell("am start -n com.google.android.tvlauncher/.MainActivity")
        print("\nDone! TV should show the home screen now.")
    else:
        print("\nLaunchers not in disabled list. Trying force-start...")
        for pkg in LAUNCHERS[:2]:
            out = adb.shell(f"am start -n {pkg}/.MainActivity")
            print(out)

    adb.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: python {sys.argv[0]} <TV_IP>")
        sys.exit(1)
    fix(sys.argv[1])
