"""
Second Brain HTTP server — with conversation memory per session.
Run as regular user (not admin) for Outlook access.
Port 8081.
"""
import json, os, socket, uuid, threading, datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import agent
import memory as mem

# In-memory sessions: session_id -> list of messages
SESSIONS = {}

# ── Chat persistence ───────────────────────────────────────────────────────────
CHATS_FILE = os.path.join(os.path.dirname(__file__), "chats.json")

def load_chats():
    if not os.path.exists(CHATS_FILE):
        return []
    try:
        with open(CHATS_FILE) as f:
            return json.load(f).get("chats", [])
    except Exception:
        return []

def save_chats(chats):
    with open(CHATS_FILE, "w") as f:
        json.dump({"chats": chats}, f, indent=2)

def upsert_chat(session_id, messages):
    """Save or update a chat. Auto-generates title from first user message."""
    if not messages:
        return
    chats = load_chats()
    title = "New chat"
    for m in messages:
        if m.get("role") == "user" and isinstance(m.get("content"), str):
            title = m["content"][:60].strip()
            if len(m["content"]) > 60:
                title += "..."
            break

    now = datetime.datetime.now().isoformat()
    for c in chats:
        if c["id"] == session_id:
            c["messages"] = messages
            c["title"]    = title
            c["updated"]  = now
            save_chats(chats)
            return

    chats.insert(0, {
        "id":       session_id,
        "title":    title,
        "created":  now,
        "updated":  now,
        "messages": messages,
    })
    # Keep last 100 chats
    save_chats(chats[:100])


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_GET(self):
        path = urlparse(self.path).path

        if path in ("/", "/index.html"):
            html = open(os.path.join(os.path.dirname(__file__), "chat.html"), "rb").read()
            self._respond(200, "text/html", html)

        elif path == "/new_session":
            sid = str(uuid.uuid4())
            SESSIONS[sid] = []
            self._json(200, {"session_id": sid})

        elif path == "/chats":
            chats = load_chats()
            # Return metadata only (no messages) for the list
            summary = [{"id": c["id"], "title": c["title"], "updated": c["updated"]} for c in chats]
            self._json(200, {"chats": summary})

        elif path.startswith("/chat/"):
            chat_id = path[6:]
            chats = load_chats()
            match = next((c for c in chats if c["id"] == chat_id), None)
            if match:
                self._json(200, match)
            else:
                self._json(404, {"ok": False, "msg": "Chat not found"})

        else:
            self._json(404, {"ok": False, "msg": "Not found"})

    def do_DELETE(self):
        path = urlparse(self.path).path
        if path.startswith("/chat/"):
            chat_id = path[6:]
            chats = [c for c in load_chats() if c["id"] != chat_id]
            save_chats(chats)
            if chat_id in SESSIONS:
                del SESSIONS[chat_id]
            self._json(200, {"ok": True})
        else:
            self._json(404, {"ok": False, "msg": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/ask":
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length))
            question   = body.get("q", "").strip()
            session_id = body.get("session_id", "default")
            files      = body.get("files", [])  # [{name, mime, data (base64)}]

            if not question and not files:
                self._json(400, {"ok": False, "msg": "Empty message"})
                return

            if session_id not in SESSIONS:
                saved = next((c for c in load_chats() if c["id"] == session_id), None)
                SESSIONS[session_id] = saved["messages"] if saved else []

            try:
                answer, updated_history = agent.run(question, SESSIONS[session_id], files)
                SESSIONS[session_id] = updated_history
                upsert_chat(session_id, updated_history)
                self._json(200, {"ok": True, "answer": answer})
                threading.Thread(
                    target=mem.extract_and_save,
                    args=(updated_history, agent.CFG["anthropic_api_key"]),
                    daemon=True
                ).start()
            except Exception as e:
                self._json(500, {"ok": False, "msg": str(e)})
        else:
            self._json(404, {"ok": False, "msg": "Not found"})

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _respond(self, status, ct, body):
        self.send_response(status)
        self.send_header("Content-Type", ct)
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status, data):
        self._respond(status, "application/json", json.dumps(data).encode())


if __name__ == "__main__":
    PORT = 8081
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    print(f"\n  Second Brain  →  http://{ip}:{PORT}\n")
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
