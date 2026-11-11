import * as cheerio from 'cheerio';
import { safeFetch } from './safe-url.js';
import { renderedHtml } from './browser.js';

const SKIP = /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|css|js|xml|ico|mp4|mp3)(\?|$)/i;
const PRIORITY = /(pricing|price|plans|contact|about|service|product|feature|solution|demo|quote|book|signup|sign-up|get-started|trial|checkout|cart|shop)/i;
const LOW = /(blog|news|article|post|tag|category|privacy|terms|cookie|login|sign-in|account|wp-)/i;

function clean(u: string, origin: string): string | null {
  try {
    const x = new URL(u, origin);
    if (x.origin !== origin || SKIP.test(x.pathname)) return null;
    x.hash = '';
    x.search = '';
    const s = x.toString();
    return s.endsWith('/') && x.pathname !== '/' ? s.slice(0, -1) : s;
  } catch {
    return null;
  }
}

async function sitemapUrls(origin: string): Promise<string[]> {
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  try {
    const robots = await safeFetch(`${origin}/robots.txt`, 'text/plain');
    for (const m of robots.matchAll(/^sitemap:\s*(\S+)/gim)) candidates.unshift(m[1]);
  } catch {}
  const out: string[] = [];
  for (const sm of [...new Set(candidates)].slice(0, 3)) {
    try {
      const xml = await safeFetch(sm);
      const $ = cheerio.load(xml, { xmlMode: true });
      const locs = $('loc').map((_, e) => $(e).text().trim()).get();
      const nested = locs.filter((l) => /\.xml(\?|$)/i.test(l)).slice(0, 3);
      out.push(...locs.filter((l) => !/\.xml(\?|$)/i.test(l)));
      for (const n of nested) {
        try {
          const $$ = cheerio.load(await safeFetch(n), { xmlMode: true });
          out.push(...$$('loc').map((_, e) => $$(e).text().trim()).get());
        } catch {}
      }
      if (out.length) break;
    } catch {}
  }
  return out;
}

async function homepageLinks(home: string): Promise<string[]> {
  const grab = (html: string) => {
    const $ = cheerio.load(html);
    return $('a[href]').map((_, e) => $(e).attr('href')!).get();
  };
  let links: string[] = [];
  try { links = grab(await safeFetch(home)); } catch {}
  if (links.length < 3) {
    // probably a JS-rendered site -> use the real browser
    try { links = grab(await renderedHtml(home)); } catch {}
  }
  return links;
}

export async function discoverPages(start: URL, max = 10): Promise<string[]> {
  const origin = start.origin;
  const home = clean(start.toString(), origin) || origin;
  let raw = await sitemapUrls(origin);
  if (raw.length < 3) raw = [...raw, ...(await homepageLinks(home))];

  const set = new Set<string>();
  for (const r of raw) {
    const c = clean(r, origin);
    if (c) set.add(c);
  }
  set.delete(home);
  set.delete(origin);
  const score = (u: string) => (PRIORITY.test(u) ? 0 : LOW.test(u) ? 2 : 1) * 100 + new URL(u).pathname.length;
  const sorted = [...set].sort((a, b) => score(a) - score(b));
  return [home, ...sorted].slice(0, max);
}
