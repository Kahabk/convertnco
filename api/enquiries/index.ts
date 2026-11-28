import { createHmac } from 'node:crypto';
import { route, HttpError, requireJson, requireSameOrigin } from '../_lib/http.js';
import { requireAdmin } from '../_lib/auth.js';
import { sb } from '../_lib/supabase.js';

const SERVICES = new Set([
  'Shopify website',
  'AI automation',
  'Product advertising',
  'Digital marketing',
]);

type EnquiryBody = Record<string, unknown>;

function text(body: EnquiryBody, key: string, maxLength: number) {
  const value = body[key];
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new HttpError(400, `${key} must be text`);
  if (value.length > maxLength) throw new HttpError(400, `${key} is too long`);
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value)) {
    throw new HttpError(400, `${key} contains unsupported characters`);
  }
  return value.trim();
}

function clientIp(req: Parameters<typeof requireSameOrigin>[0]) {
  const header = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
  const raw = Array.isArray(header) ? header[0] : header;
  return raw?.split(',')[0]?.trim() || 'unknown';
}

function limiterKey(label: string, value: string) {
  const secret = process.env.RATE_LIMIT_SALT
    || process.env.SUPABASE_SECRET_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new HttpError(500, 'Rate-limit secret missing');
  return createHmac('sha256', secret).update(`${label}:${value}`).digest('hex');
}

function storageUnavailable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return ['42P01', '42883', 'PGRST202', 'PGRST205'].includes(error.code || '')
    || /enquir(y|ies)|schema cache|function/i.test(error.message || '');
}

function throwStorageError(error: { code?: string; message?: string }) : never {
  if (storageUnavailable(error)) {
    throw new HttpError(503, 'Enquiry storage is not configured yet. Run supabase/enquiries.sql, then try again.');
  }
  throw error;
}

async function consumeLimit(identifierHash: string, limit: number) {
  const { data, error } = await sb.rpc('consume_enquiry_rate_limit', {
    p_identifier_hash: identifierHash,
    p_limit: limit,
    p_window_seconds: 600,
  });
  if (error) throwStorageError(error);
  return data === true;
}

export default route(async (req, res) => {
  if (req.method === 'GET') {
    requireSameOrigin(req);
    await requireAdmin(req);

    const { data, error } = await sb
      .from('enquiries')
      .select('id,name,email,company,service,budget,message,status,created_at')
      .order('created_at', { ascending: false })
      .limit(250);

    if (error) throwStorageError(error);
    return res.json({ enquiries: data ?? [] });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    throw new HttpError(405, 'Method not allowed');
  }
  requireSameOrigin(req);
  requireJson(req);
  const body = req.body as EnquiryBody;

  // Honeypot field: bots see it, people do not. Return success without storing spam.
  if (text(body, 'website', 200)) {
    return res.status(201).json({ ok: true });
  }

  const name = text(body, 'name', 120);
  const email = text(body, 'email', 254).toLowerCase();
  const company = text(body, 'company', 160);
  const requestedService = text(body, 'service', 80);
  const service = SERVICES.has(requestedService) ? requestedService : '';
  const budget = text(body, 'budget', 100);
  const message = text({ message: body.message ?? body.project }, 'message', 5000);

  if (name.length < 2) throw new HttpError(400, 'Please enter your name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Please enter a valid email address');
  if (requestedService && !service) throw new HttpError(400, 'Please choose a valid service');
  if (message.length < 10) throw new HttpError(400, 'Please tell us a little more about your project');

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeLimit(limiterKey('ip', clientIp(req)), 5),
    consumeLimit(limiterKey('email', email), 3),
  ]);
  if (!ipAllowed || !emailAllowed) {
    res.setHeader('Retry-After', '600');
    throw new HttpError(429, 'Too many enquiries. Please wait a few minutes and try again.');
  }

  const { data, error } = await sb
    .from('enquiries')
    .insert({
      name,
      email,
      company: company || null,
      service: service || null,
      budget: budget || null,
      message,
      source: 'website',
    })
    .select('id')
    .single();

  if (error) throwStorageError(error);
  return res.status(201).json({ ok: true, id: data.id });
});
