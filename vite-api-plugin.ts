import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';

// Load server environment variables from .env
dotenv.config();

export function vercelApiPlugin(): Plugin {
  return {
    name: 'vite-plugin-vercel-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage & any, res: ServerResponse & any, next: () => void) => {
        const urlStr = req.url || '';
        const [pathname, search] = urlStr.split('?');

        if (!pathname.startsWith('/api/')) {
          return next();
        }

        // Parse query params
        const searchParams = new URLSearchParams(search || '');
        const query: Record<string, string> = {};
        searchParams.forEach((val, key) => {
          query[key] = val;
        });

        // Parse JSON body for POST / PUT / PATCH (capped at 1MB to prevent memory exhaustion DoS)
        let body: any = {};
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          const MAX_BODY_SIZE = 1024 * 1024; // 1 MB
          let receivedBytes = 0;
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            receivedBytes += chunk.length;
            if (receivedBytes > MAX_BODY_SIZE) {
              res.statusCode = 413;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Payload too large (max 1MB)' }));
              return;
            }
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          if (raw.trim()) {
            try {
              body = JSON.parse(raw);
            } catch {
              body = raw;
            }
          }
        }

        req.query = query;
        req.body = body;

        // Polyfill VercelResponse methods
        res.status = (statusCode: number) => {
          res.statusCode = statusCode;
          return res;
        };

        res.json = (data: any) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        res.send = (data: any) => {
          if (typeof data === 'object') {
            return res.json(data);
          }
          res.end(data);
          return res;
        };

        try {
          // Route 1: /api/audits/:id/process
          const processMatch = pathname.match(/^\/api\/audits\/([^/]+)\/process\/?$/);
          if (processMatch) {
            req.query.id = processMatch[1];
            const mod = await server.ssrLoadModule('/api/audits/[id]/process.ts');
            await mod.default(req, res);
            return;
          }

          // Route 2: /api/audits/:id
          const auditMatch = pathname.match(/^\/api\/audits\/([^/]+)\/?$/);
          if (auditMatch) {
            req.query.id = auditMatch[1];
            const mod = await server.ssrLoadModule('/api/audits/[id]/index.ts');
            await mod.default(req, res);
            return;
          }

          // Route 3: /api/audits
          if (pathname === '/api/audits' || pathname === '/api/audits/') {
            const mod = await server.ssrLoadModule('/api/audits/index.ts');
            await mod.default(req, res);
            return;
          }

          res.status(404).json({ error: `Not found: ${pathname}` });
        } catch (err: any) {
          console.error(`[API Error] ${pathname}:`, err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || 'Internal server error' });
          }
        }
      });
    },
  };
}
