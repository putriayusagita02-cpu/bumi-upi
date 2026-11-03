/**
 * BUMI UPI CRM — ZERO-DEPENDENCY NODE.JS FULL-STACK SERVER
 * =============================================================================
 * Case Study: Rumah Tamah Bumi Upi, Garut, Jawa Barat
 * Run this directly in terminal:
 *    node server.js
 * Then open browser at: http://localhost:3000
 * =============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon',
};

// Processed Telegram update IDs for Webhook idempotency
const processedUpdateIds = new Set();

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. API Endpoint: Telegram Webhook (/api/telegram/webhook)
  if (pathname === '/api/telegram/webhook' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const updateId = payload.update_id;

        // Idempotency check
        if (updateId && processedUpdateIds.has(updateId)) {
          console.log(`[Telegram Webhook] Update ${updateId} already processed (Idempotent Skip)`);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ok: true, status: 'already_processed' }));
        }
        if (updateId) processedUpdateIds.add(updateId);

        console.log('[Telegram Webhook Received]:', payload.message?.text || payload.message?.contact || 'Event');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, status: 'processed_wib' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 2. API Endpoint: Upi Chat AI (/api/ai/chat)
  if (pathname === '/api/ai/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const q = (payload.prompt || '').toLowerCase();
        let reply = 'Sampurasun! Wilujeng sumping di Rumah Tamah Bumi Upi.';

        if (q.includes('jam') || q.includes('buka')) {
          reply = 'Bumi Upi buka setiap hari dari pukul 07:00 sampai 23:00 WIB.';
        } else if (q.includes('menu') || q.includes('makan')) {
          reply = 'Menu andalan: Nasi Goreng Kecombrang (Rp 26.000), Gulai Sapi Pasundan (Rp 34.000), dan Es Cokelat Bumi (Rp 22.000).';
        } else if (q.includes('poin')) {
          reply = 'Aturan poin: Setiap belanja Rp 10.000 = 1 Poin Bumi. Tier: Tamu -> Sahabat -> Keluarga.';
        } else {
          reply = 'Punten, Upi belum memiliki informasi tersebut dalam data resmi. Silakan kontak WhatsApp admin kami di 0812-2334-4550 ya!';
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          reply,
          provider: 'local_knowledge',
          latencyMs: 140
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. Static Files & SPA Fallback
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA client routing
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server Error: File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('  🏡 BUMI UPI CRM SERVER BERJALAN DI LOCALHOST!');
  console.log(`  👉 Buka di browser: http://localhost:${PORT}`);
  console.log('  🕒 Zona Waktu: 100% WIB (Asia/Jakarta, UTC+7)');
  console.log('  📦 Mode: Full-Stack SPA & Telegram Bot Engine Aktif');
  console.log('='.repeat(70));
});
