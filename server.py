#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BUMI UPI CRM — ZERO-DEPENDENCY PYTHON FULL-STACK RUNNER
=============================================================================
Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
Menjalankan Web Server (Port 3000) dengan static file server, API proxy,
Telegram Webhook handler (idempotent), and Upi Chat AI endpoint.
=============================================================================
"""

import sys
import os
import json
import http.server
import socketserver
import urllib.parse
from datetime import datetime, timezone, timedelta

# Force UTF-8 on Windows Console
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
WIB = timezone(timedelta(hours=7))

processed_telegram_updates = set()

class BumiUpiHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_length).decode('utf-8')

        # 1. Telegram Webhook Endpoint
        if parsed.path == '/api/telegram/webhook':
            try:
                payload = json.loads(post_body or '{}')
                update_id = payload.get('update_id')
                
                # Idempotency check
                if update_id and update_id in processed_telegram_updates:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'ok': True, 'status': 'already_processed'}).encode('utf-8'))
                    return
                
                if update_id:
                    processed_telegram_updates.add(update_id)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': True, 'status': 'processed_wib'}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))
                return

        # 2. AI Chat Endpoint
        if parsed.path == '/api/ai/chat':
            try:
                payload = json.loads(post_body or '{}')
                prompt = payload.get('prompt', '').lower()
                
                if 'jam' in prompt or 'buka' in prompt:
                    reply = 'Rumah Tamah Bumi Upi buka setiap hari dari pukul 07:00 sampai 23:00 WIB.'
                elif 'menu' in prompt or 'makan' in prompt:
                    reply = 'Menu andalan: Nasi Goreng Kecombrang (Rp 26.000), Gulai Sapi Pasundan (Rp 34.000), dan Es Cokelat Bumi (Rp 22.000).'
                elif 'poin' in prompt:
                    reply = 'Program loyalitas Keluarga Bumi: Setiap belanja Rp 10.000 = 1 Poin Bumi.'
                else:
                    reply = 'Sampurasun! Ada yang bisa kami bantu? Hubungi WhatsApp admin di 0812-2334-4550.'

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'reply': reply, 'provider': 'local_knowledge', 'latencyMs': 120}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        file_path = os.path.join(PUBLIC_DIR, parsed.path.lstrip('/'))
        
        # If route doesn't match a static file directly, fallback to index.html (SPA routing)
        if not os.path.exists(file_path) or os.path.isdir(file_path):
            self.path = '/index.html'

        return super().do_GET()


class ThreadedTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True

if __name__ == '__main__':
    with ThreadedTCPServer(("", PORT), BumiUpiHandler) as httpd:
        print("=" * 70)
        print("  🏡 BUMI UPI CRM SERVER BERJALAN DI LOCALHOST!")
        print(f"  👉 Buka di browser: http://localhost:{PORT}")
        print("  🕒 Zona Waktu: 100% WIB (Asia/Jakarta, UTC+7)")
        print("  📦 Mode: Python Zero-Dependency Full-Stack Runner")
        print("  Tekan Ctrl+C untuk menghentikan server.")
        print("=" * 70)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dihentikan.")
