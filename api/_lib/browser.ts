import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { safeFetch, assertSafeUrl } from './safe-url.js';

const execFileAsync = promisify(execFile);

// Browserless REST API: rendered HTML + screenshots
const base = () => process.env.BROWSERLESS_URL || 'https://production-sfo.browserless.io';
const tok = () => encodeURIComponent(process.env.BROWSERLESS_TOKEN || '');

const VIEWPORTS = {
  desktop: { width: 1366, height: 768 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * A public site may briefly reject an automated fetch while still being available.
 * Retry transient responses before treating the page as unavailable.
 */
async function fetchPageWithRetry(url: string): Promise<Response> {
  let lastResponse: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(20000),
    });
    if (response.ok || (response.status !== 429 && response.status < 500)) return response;
    lastResponse = response;
    if (attempt < 2) {
      const retryAfter = Number(response.headers.get('retry-after'));
      await pause(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 4000) : 900 * (attempt + 1));
    }
  }
  return lastResponse!;
}

export async function renderedHtml(url: string): Promise<string> {
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    try {
      const r = await fetch(`${base()}/content?token=${tok()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          gotoOptions: { waitUntil: 'networkidle2', timeout: 25000 },
          bestAttempt: true,
        }),
        signal: AbortSignal.timeout(40000),
      });
      if (r.ok) return (await r.text()).slice(0, 2_000_000);
    } catch (e) {
      console.warn('Browserless content fetch failed, falling back to direct fetch:', e);
    }
  }

  // Fallback: direct HTML fetch with SSRF re-validation on every redirect hop
  return await safeFetch(url);
}

export async function screenshot(url: string, device: 'desktop' | 'mobile'): Promise<Buffer | null> {
  const isMobile = device === 'mobile';
  const ua = isMobile
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // 1. Browserless (if configured)
  const token = process.env.BROWSERLESS_TOKEN;
  if (token) {
    try {
      const r = await fetch(`${base()}/screenshot?token=${tok()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          viewport: VIEWPORTS[device],
          options: { fullPage: false, type: 'jpeg', quality: 65 },
          gotoOptions: { waitUntil: 'networkidle2', timeout: 25000 },
          bestAttempt: true,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) {
        const buf = Buffer.from(await r.arrayBuffer());
        if (buf.length > 1000) return buf;
      }
    } catch (e) {
      console.warn('Browserless screenshot failed, trying local fallback:', e);
    }
  }

  // 2. Local Google Chrome with real browser headers (local dev)
  const tmpPath = path.join(os.tmpdir(), `shot_${Date.now()}_${device}.jpg`);
  try {
    const vp = VIEWPORTS[device];
    await execFileAsync('google-chrome', [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--user-agent=${ua}`,
      `--window-size=${vp.width},${vp.height}`,
      `--screenshot=${tmpPath}`,
      '--',
      url,
    ], { timeout: 15000 });

    if (fs.existsSync(tmpPath)) {
      const buf = await fs.promises.readFile(tmpPath);
      await fs.promises.unlink(tmpPath).catch(() => {});
      if (buf.length > 1000) return buf;
    }
  } catch {
    await fs.promises.unlink(tmpPath).catch(() => {});
  }

  // 3. Cloud / Serverless fallback: Microlink API (no credentials needed, runs on Vercel)
  try {
    const params = new URLSearchParams({
      url,
      screenshot: 'true',
      meta: 'false',
      viewport: isMobile ? '390x844' : '1366x768',
    });
    if (isMobile) {
      params.set('device', 'iPhone 13');
    }
    const r = await fetch(`https://api.microlink.io/?${params.toString()}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    if (r.ok) {
      const json: any = await r.json();
      const shotUrl = json?.data?.screenshot?.url;
      if (shotUrl) {
        const imgRes = await fetch(shotUrl, { signal: AbortSignal.timeout(10000) });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 1000) return buf;
        }
      }
    }
  } catch (mlErr) {
    console.warn('Microlink screenshot fallback error:', mlErr);
  }

  return null;
}
