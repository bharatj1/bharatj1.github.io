"""
Freshservice API tool — read-only, no writes ever.
"""
import urllib.request
import urllib.parse
import base64
import json


class Freshservice:
    def __init__(self, domain, api_key):
        self.base = f"https://{domain}/api/v2"
        # Basic auth: api_key:X
        creds = base64.b64encode(f"{api_key}:X".encode()).decode()
        self.headers = {
            "Authorization": f"Basic {creds}",
            "Content-Type": "application/json"
        }

    def _get(self, path, params=None):
        url = f"{self.base}{path}"
        if params:
            url += "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers=self.headers)
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            return {"error": f"HTTP {e.code}: {e.read().decode()[:200]}"}
        except Exception as e:
            return {"error": str(e)}

    def search_tickets(self, query):
        """Search tickets by keyword — returns list of matching tickets."""
        result = self._get("/tickets", {"query": f'"{query}"', "include": "requester"})
        tickets = result.get("tickets", [])
        return [
            {
                "id": t["id"],
                "subject": t["subject"],
                "status": self._status(t["status"]),
                "priority": self._priority(t["priority"]),
                "requester": t.get("requester", {}).get("name", "Unknown"),
                "created_at": t["created_at"],
                "updated_at": t["updated_at"],
            }
            for t in tickets[:10]  # cap at 10
        ]

    def get_ticket(self, ticket_id):
        """Get full ticket details."""
        result = self._get(f"/tickets/{ticket_id}", {"include": "requester,stats"})
        t = result.get("ticket", {})
        if not t:
            return result
        return {
            "id": t["id"],
            "subject": t["subject"],
            "description": self._strip_html(t.get("description_text", t.get("description", ""))),
            "status": self._status(t["status"]),
            "priority": self._priority(t["priority"]),
            "requester": t.get("requester", {}).get("name", "Unknown"),
            "agent": t.get("responder_id"),
            "created_at": t["created_at"],
            "updated_at": t["updated_at"],
        }

    def get_ticket_comments(self, ticket_id):
        """Get all comments/conversation on a ticket."""
        result = self._get(f"/tickets/{ticket_id}/conversations")
        convs = result.get("conversations", [])
        return [
            {
                "from": c.get("from_email", "agent"),
                "body": self._strip_html(c.get("body_text", c.get("body", ""))),
                "created_at": c["created_at"],
                "private": c.get("private", False),
            }
            for c in convs
        ]

    def _status(self, code):
        return {2: "Open", 3: "Pending", 4: "Resolved", 5: "Closed"}.get(code, str(code))

    def _priority(self, code):
        return {1: "Low", 2: "Medium", 3: "High", 4: "Urgent"}.get(code, str(code))

    def _strip_html(self, text):
        import re
        return re.sub(r"<[^>]+>", "", text or "").strip()
