"""
One-time Teams login for the second brain.
Uses Microsoft's own Graph CLI app — no Azure portal needed.
Run: python setup_teams_brain.py
"""
import json, time, urllib.request, urllib.parse, os

TOKEN_FILE = os.path.join(os.path.dirname(__file__), "teams_token.json")
CLIENT_ID  = "14d82eec-204b-4c2f-b7e8-296a70dab67e"
SCOPES     = "Chat.Read ChannelMessage.Read.All Presence.ReadWrite offline_access User.Read"

cfg_path = os.path.join(os.path.dirname(__file__), "config.json")
with open(cfg_path) as f:
    CFG = json.load(f)

TENANT_ID = CFG.get("tenant_id", "common")

# Step 1: device code
url  = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/devicecode"
data = urllib.parse.urlencode({"client_id": CLIENT_ID, "scope": SCOPES}).encode()
req  = urllib.request.Request(url, data=data)
with urllib.request.urlopen(req) as r:
    resp = json.loads(r.read())

print(f"\n  1. Open:  {resp['verification_uri']}")
print(f"  2. Enter: {resp['user_code']}")
print(f"\n  Waiting for login...\n")

# Step 2: poll
token_url = f"https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token"
interval  = resp.get("interval", 5)
deadline  = time.time() + resp.get("expires_in", 900)

while time.time() < deadline:
    time.sleep(interval)
    poll = urllib.parse.urlencode({
        "client_id":   CLIENT_ID,
        "grant_type":  "urn:ietf:params:oauth:grant-type:device_code",
        "device_code": resp["device_code"],
    }).encode()
    try:
        req2 = urllib.request.Request(token_url, data=poll)
        with urllib.request.urlopen(req2) as r2:
            token = json.loads(r2.read())
    except urllib.error.HTTPError as e:
        err = json.loads(e.read())
        if err.get("error") == "authorization_pending":
            continue
        print(f"  Error: {err.get('error_description', err)}")
        break

    with open(TOKEN_FILE, "w") as f:
        json.dump({
            "client_id":     CLIENT_ID,
            "tenant_id":     TENANT_ID,
            "refresh_token": token["refresh_token"],
            "access_token":  token["access_token"],
            "expires_at":    time.time() + token["expires_in"],
        }, f, indent=2)

    print(f"  Done! Teams access ready.\n")
    break
