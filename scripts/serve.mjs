#!/usr/bin/env node
/** 本地预览服务器（可选）：node scripts/serve.mjs [端口] */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8899;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http
  .createServer(async (req, res) => {
    const p = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    try {
      const file = await fs.readFile(path.join(ROOT, p));
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(p)] || 'application/octet-stream',
      });
      res.end(file);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  })
  .listen(PORT, () => {
    console.log(`✓ 梗雷达已启动  http://localhost:${PORT}`);
  });
