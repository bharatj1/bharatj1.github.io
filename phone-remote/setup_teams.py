"""
One-time Teams auth setup.
Run this ONCE: python setup_teams.py
It will give you a code to enter at microsoft.com/devicelogin.
After you log in it saves a refresh token — you never need to do this again.
"""

import json
import time
import urllib.request
import urllib.parse
import os

# ── Paste your values from Azure portal after app registration ──────────────
CLIENT_ID = ""   # Application (client) ID
TENANT_ID = ""   # Directory (tenant) ID
# ────────────────────────────────────────────────────────────────────────────

TOKEN_FILE = os.path.join(os.path.dirname(__file__), "teams_token.json")
SCOPES = "Presence.ReadWrite offline_access"


def device_code_login():
    if not CLIENT_ID or not TENANT_ID:
        print("\n  ERROR: Fill in CLIENT_ID and TENANT_ID in this file first.")
        print("  See SETUP.md → Teams Setup section.\n")
        return

    # Step 1: request device code
    url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/devicecode"
    data = urllib.parse.urlencode({"client_id": CLIENT_ID, "scope": SCOPES}).encode()
    req = urllib.request.Request(url, data=data)
    with urllib.request.urlopen(req) as r:
        resp = json.loads(r.read())

    print(f"\n  1. Open this URL on any device:  {resp['verification_uri']}")
    print(f"  2. Enter this code:              {resp['user_code']}")
    print(f"\n  Waiting for you to log in...\n")

    # Step 2: poll for token
    token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
    interval = resp.get("interval", 5)
    deadline = time.time() + resp.get("expires_in", 900)

    while time.time() < deadline:
        time.sleep(interval)
        poll_data = urllib.parse.urlencode({
            "client_id":   CLIENT_ID,
            "grant_type":  "urn:ietf:params:oauth:grant-type:device_code",
            "device_code": resp["device_code"],
        }).encode()
        try:
            req2 = urllib.request.Request(token_url, data=poll_data)
            with urllib.request.urlopen(req2) as r2:
                token = json.loads(r2.read())
        except urllib.error.HTTPError as e:
            err = json.loads(e.read())
            if err.get("error") == "authorization_pending":
                continue
            print(f"  Error: {err.get('error_description', err)}")
            return

        # Save token
        with open(TOKEN_FILE, "w") as f:
            json.dump({
                "client_id":     CLIENT_ID,
                "tenant_id":     TENANT_ID,
                "refresh_token": token["refresh_token"],
                "access_token":  token["access_token"],
                "expires_at":    time.time() + token["expires_in"],
            }, f, indent=2)

        print(f"  Logged in! Token saved to teams_token.json")
        print(f"  Teams status control is ready.\n")
        return

    print("  Timed out waiting for login.")


if __name__ == "__main__":
    device_code_login()
