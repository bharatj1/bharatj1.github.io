"""
Second Brain HTTP server.
Serves the chat UI and runs the agent.
Run as: python server.py
"""
import json, os, socket, threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

import agent


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a): pass

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ("/", "/index.html"):
            html = open(os.path.join(os.path.dirname(__file__), "chat.html"), "rb").read()
            self._respond(200, "text/html", html)
        else:
            self._json(404, {"ok": False, "msg": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        if path == "/ask":
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length))
            question = body.get("q", "").strip()
            if not question:
                self._json(400, {"ok": False, "msg": "Empty question"})
                return
            try:
                answer = agent.run(question)
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

    def _respond(self, status, content_type, body):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", len(body))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, status, data):
        self._respond(status, "application/json", json.dumps(data).encode())


if __name__ == "__main__":
    PORT = 8081  # different from phone-remote (8080)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()

    print(f"\n  Second Brain running at  http://{ip}:{PORT}")
    print(f"  Open this on your phone ^\n")
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
