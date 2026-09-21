import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('out');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain' };
createServer(async (req, res) => {
 try {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let file = resolve(root, '.' + path);
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
  res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
  res.end(await readFile(file));
 } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('No encontrado'); }
}).listen(3000, '0.0.0.0', () => console.log('Preview: http://localhost:3000'));
