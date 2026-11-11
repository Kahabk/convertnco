import dns from 'node:dns/promises';
import net from 'node:net';
import { HttpError } from './http.js';

function privateV4(ip: string) {
  const [a, b, c] = ip.split('.').map(Number);
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 169 && b === 254) ||               // Link-local / Cloud metadata (AWS, Azure, GCP 169.254.169.254)
    (a === 172 && b >= 16 && b <= 31) ||       // RFC 1918 Private
    (a === 192 && b === 168) ||                // RFC 1918 Private
    (a === 100 && b >= 64 && b <= 127) ||      // Carrier-grade NAT / Alibaba metadata (100.100.100.200)
    (a === 192 && b === 0 && c === 2) ||        // TEST-NET-1
    (a === 198 && b === 51 && c === 100) ||     // TEST-NET-2
    (a === 203 && b === 0 && c === 113) ||     // TEST-NET-3
    (a === 198 && (b === 18 || b === 19))      // Benchmarking
  );
}
function privateIp(ip: string) {
  if (net.isIPv4(ip)) return privateV4(ip);
  const l = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (l.startsWith('::ffff:')) return privateV4(l.slice(7));
  if (l.startsWith('0:0:0:0:0:ffff:')) return privateV4(l.slice(15));
  return (
    l === '::1' ||
    l === '::' ||
    l.startsWith('fc') ||
    l.startsWith('fd') ||
    l.startsWith('fe80') ||
    l.startsWith('2001:db8') ||
    l.startsWith('100::')
  );
}

export async function assertSafeUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`);
  } catch {
    throw new HttpError(400, 'Invalid URL');
  }
  if (!['http:', 'https:'].includes(u.protocol)) throw new HttpError(400, 'Only http/https allowed');
  if (u.port && !['80', '443'].includes(u.port)) throw new HttpError(400, 'Port not allowed');
  if (u.username || u.password) throw new HttpError(400, 'Credentials in URL not allowed');
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host === 'metadata' ||
    host === 'metadata.google.internal' ||
    host === 'instance-data'
  ) {
    throw new HttpError(400, 'Host not allowed');
  }
  let addrs: { address: string }[];
  try {
    addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  } catch {
    throw new HttpError(400, 'Could not resolve that domain');
  }
  if (addrs.some((a) => privateIp(a.address))) throw new HttpError(400, 'Host not allowed');
  return u;
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

/** fetch that re-validates every redirect hop */
export async function safeFetch(url: string, accept = 'text/html,application/xml'): Promise<string> {
  let current = url;
  for (let i = 0; i < 5; i++) {
    await assertSafeUrl(current);
    const res = await fetch(current, {
      redirect: 'manual',
      headers: {
        ...BROWSER_HEADERS,
        Accept: accept || BROWSER_HEADERS['Accept'],
      },
      signal: AbortSignal.timeout(20000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location')!, current).toString();
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.text()).slice(0, 2_000_000);
  }
  throw new Error('Too many redirects');
}
