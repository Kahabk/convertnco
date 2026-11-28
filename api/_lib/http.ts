import type { VercelRequest, VercelResponse } from '@vercel/node';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function firstHeader(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.split(',')[0]?.trim() || '';
}

function configuredOrigins(req: VercelRequest) {
  const origins = new Set<string>();
  const host = firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host);
  const forwardedProto = firstHeader(req.headers['x-forwarded-proto']);
  const protocol = forwardedProto || (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https');

  if (host) origins.add(`${protocol}://${host}`);

  for (const value of [process.env.APP_URL, process.env.VERCEL_URL]) {
    if (!value || value.startsWith('MY_')) continue;
    try {
      const candidate = value.includes('://') ? value : `https://${value}`;
      origins.add(new URL(candidate).origin);
    } catch {
      // Ignore malformed optional URLs; the request host remains authoritative.
    }
  }

  return origins;
}

/** Reject browser requests sent from another site. Non-browser clients are
 * still protected by validation and rate limiting at the endpoint. */
export function requireSameOrigin(req: VercelRequest) {
  const fetchSite = firstHeader(req.headers['sec-fetch-site']);
  if (fetchSite === 'cross-site') throw new HttpError(403, 'Cross-site request denied');

  const origin = firstHeader(req.headers.origin);
  if (!origin) return;

  let normalizedOrigin = '';
  try {
    normalizedOrigin = new URL(origin).origin;
  } catch {
    throw new HttpError(403, 'Invalid request origin');
  }

  if (!configuredOrigins(req).has(normalizedOrigin)) {
    throw new HttpError(403, 'Cross-site request denied');
  }
}

export function requireJson(req: VercelRequest, maxBytes = 32 * 1024) {
  const contentType = firstHeader(req.headers['content-type']).toLowerCase();
  if (!contentType.startsWith('application/json')) {
    throw new HttpError(415, 'Content-Type must be application/json');
  }

  const contentLength = Number(firstHeader(req.headers['content-length']));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new HttpError(413, 'Request body is too large');
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
}

export function route(fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Standard API security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Authorization, Origin');

    // Handle OPTIONS preflight requests cleanly
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    try {
      await fn(req, res);
    } catch (e: any) {
      const status = e instanceof HttpError ? e.status : 500;
      if (status === 500) console.error('[API Internal Error]:', e);
      res.status(status).json({ error: status === 500 ? 'Internal error' : String(e?.message || e).slice(0, 300) });
    }
  };
}
