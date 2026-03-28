"""
Second Brain HTTP server — with conversation memory per session.
Run as regular user (not admin) for Outlook access.
Port 8081.
"""
import json, os, socket, uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import agent

# Session store: session_id -> list of messages
SESSIONS = {}


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
        else:
            self._json(404, {"ok": False, "msg": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/ask":
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length))
            question   = body.get("q", "").strip()
            session_id = body.get("session_id", "default")

            if not question:
                self._json(400, {"ok": False, "msg": "Empty question"})
                return

            # Get or create session history
            if session_id not in SESSIONS:
                SESSIONS[session_id] = []

            try:
                answer, updated_history = agent.run(question, SESSIONS[session_id])
                SESSIONS[session_id] = updated_history
                self._json(200, {"ok": True, "answer": answer})
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
