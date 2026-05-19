// Custom Next.js production server.
//
// Why this file exists: `next start -H 0.0.0.0` and `HOSTNAME=0.0.0.0 next start`
// both fail to bind on 0.0.0.0 in Next.js 16 / turbopack production mode on
// Render. Next reports `Network: http://0.0.0.0:PORT` but Render's port scanner
// can't see it. Using Next's programmatic API + an explicit `server.listen(port,
// '0.0.0.0', ...)` from a node http server bypasses the broken default and
// binds reliably.
//
// Run via `node server.js` from package.json's "start" script.

const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('server.js prepare failed:', err);
  process.exit(1);
});
