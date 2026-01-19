#!/usr/bin/env python3
"""
Simple HTTP server for the Daily Word Game.
Run with: python server.py
Then open http://localhost:8000 in your browser.
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler with proper MIME types and CORS headers."""

    extensions_map = {
        '': 'application/octet-stream',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.txt': 'text/plain',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
    }

    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main():
    # Change to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    try:
        with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
            print(f"\n{'='*50}")
            print(f"  Daily Word Game Server")
            print(f"{'='*50}")
            print(f"\n  Server running at: http://localhost:{PORT}")
            print(f"  Press Ctrl+C to stop\n")
            print(f"{'='*50}\n")

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048 or e.errno == 98:  # Port already in use (Windows/Linux)
            print(f"\nError: Port {PORT} is already in use.")
            print(f"Try closing other servers or use a different port.")
            sys.exit(1)
        raise


if __name__ == "__main__":
    main()
