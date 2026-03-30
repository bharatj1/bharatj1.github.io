"""
Teams tool via Microsoft Graph — read-only, silent.
Uses Microsoft's own Graph CLI app ID (no Azure portal needed).
One-time login via setup_teams_brain.py
"""
import json
import os
import re
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

TOKEN_FILE = os.path.join(os.path.dirname(__file__), "..", "teams_token.json")

# Microsoft Graph CLI app — pre-registered by Microsoft, no Azure portal needed
GRAPH_CLIENT_ID = "14d82eec-204b-4c2f-b7e8-296a70dab67e"
SCOPES = "Chat.Read ChannelMessage.Read.All Presence.ReadWrite offline_access User.Read"


def get_token():
    if not os.path.exists(TOKEN_FILE):
        return None, "Teams not set up — run setup_teams_brain.py first"
    with open(TOKEN_FILE) as f:
        data = json.load(f)
    if time.time() < data.get("expires_at", 0) - 60:
        return data["access_token"], None
    # Refresh
    body = urllib.parse.urlencode({
        "client_id":     data.get("client_id", GRAPH_CLIENT_ID),
        "grant_type":    "refresh_token",
        "refresh_token": data["refresh_token"],
        "scope":         SCOPES,
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
        return None, str(e)


def _graph(path, token):
    req = urllib.request.Request(
        f"https://graph.microsoft.com/v1.0{path}",
        headers={"Authorization": f"Bearer {token}"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        return None, f"Graph {e.code}: {e.read().decode()[:200]}"
    except Exception as e:
        return None, str(e)


def get_my_chats():
    """Get list of recent chats."""
    token, err = get_token()
    if not token:
        return [], err
    data, err = _graph("/me/chats?$top=20&$expand=members", token)
    if err:
        return [], err
    chats = []
    for c in data.get("value", []):
        members = [m.get("displayName", "") for m in c.get("members", []) if m.get("displayName")]
        chats.append({
            "id":      c["id"],
            "topic":   c.get("topic") or ", ".join(members[:3]),
            "type":    c.get("chatType", ""),
            "members": members,
        })
    return chats, None


def search_chat_messages(person_name, days_back=7):
    """Search recent messages from a specific person across all chats."""
    token, err = get_token()
    if not token:
        return [], err

    chats, err = get_my_chats()
    if err:
        return [], err

    results = []
    cutoff = time.time() - (days_back * 86400)

    for chat in chats:
        # Only search chats that involve the person
        if person_name.lower() not in " ".join(chat["members"]).lower():
            continue

        data, err = _graph(f"/me/chats/{chat['id']}/messages?$top=30", token)
        if err or not data:
            continue

        for msg in data.get("value", []):
            try:
                created = msg.get("createdDateTime", "")
                # Parse timestamp
                ts = time.mktime(time.strptime(created[:19], "%Y-%m-%dT%H:%M:%S"))
                if ts < cutoff:
                    continue
                sender = msg.get("from", {}).get("user", {}).get("displayName", "Unknown")
                body = msg.get("body", {}).get("content", "")
                # Strip HTML
                import re
                body = re.sub(r"<[^>]+>", "", body).strip()
                if body:
                    results.append({
                        "chat":    chat["topic"],
                        "from":    sender,
                        "message": body[:500],
                        "time":    created[:16].replace("T", " "),
                    })
            except Exception:
                continue

    results.sort(key=lambda x: x["time"], reverse=True)
    return results[:30], None


def get_channel_messages(team_name=None, days_back=3):
    """Get recent messages from Teams channels. Parallel fetch, capped at 3 teams."""
    token, err = get_token()
    if not token:
        return [], err

    teams_data, err = _graph("/me/joinedTeams", token)
    if err:
        return [], err

    cutoff = time.time() - (days_back * 86400)
    all_teams = teams_data.get("value", [])

    if team_name:
        all_teams = [t for t in all_teams if team_name.lower() in t["displayName"].lower()]
    # Cap at 3 teams to keep it fast
    all_teams = all_teams[:3]

    results = []

    def fetch_team(team):
        team_results = []
        channels, err = _graph(f"/teams/{team['id']}/channels", token)
        if err or not channels:
            return team_results
        for ch in channels.get("value", [])[:2]:  # top 2 channels per team
            msgs, err = _graph(f"/teams/{team['id']}/channels/{ch['id']}/messages?$top=15", token)
            if err or not msgs:
                continue
            for msg in msgs.get("value", []):
                try:
                    created = msg.get("createdDateTime", "")
                    ts = time.mktime(time.strptime(created[:19], "%Y-%m-%dT%H:%M:%S"))
                    if ts < cutoff:
                        continue
                    sender = msg.get("from", {}).get("user", {}).get("displayName", "Unknown")
                    body = re.sub(r"<[^>]+>", "", msg.get("body", {}).get("content", "")).strip()
                    if body and len(body) > 5:
                        team_results.append({
                            "team":    team["displayName"],
                            "channel": ch["displayName"],
                            "from":    sender,
                            "message": body[:500],
                            "time":    created[:16].replace("T", " "),
                        })
                except Exception:
                    continue
        return team_results

    with ThreadPoolExecutor(max_workers=3) as ex:
        futures = [ex.submit(fetch_team, t) for t in all_teams]
        for f in as_completed(futures, timeout=20):
            try:
                results.extend(f.result())
            except Exception:
                continue

    results.sort(key=lambda x: x["time"], reverse=True)
    return results[:30], None
