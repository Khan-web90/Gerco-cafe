// Minimal static file server for local hosting
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8765;
const HOST = '0.0.0.0';
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Greca Coffee N Pastry is live locally:`);
    console.log(`  → http://localhost:${PORT}/`);
    const os = require('os');
    const ifaces = os.networkInterfaces();
    const ips = [];
    Object.values(ifaces).forEach((list) => {
        list.forEach((i) => {
            if (i.family === 'IPv4' && !i.internal) ips.push(i.address);
        });
    });
    if (ips.length) {
        console.log(`  → On your network:`);
        ips.forEach((ip) => console.log(`     http://${ip}:${PORT}/`));
    }
    console.log(`\nPress Ctrl+C to stop.`);
});
