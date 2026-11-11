import * as cheerio from 'cheerio';

export interface ExtractedPage {
  url: string;
  title: string;
  metaDescription: string;
  hasViewportMeta: boolean;
  h1: string[];
  h2: string[];
  h3: string[];
  ctas: string[];
  primaryButtons: string[];
  pricingMentions: string[];
  trustSignals: string[];
  formsCount: number;
  inputCount: number;
  inputTypes: string[];
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinksCount: number;
  externalLinksCount: number;
  hasPhoneOrEmail: boolean;
  wordCount: number;
  heroHeadline: string;
  heroSubheadline: string;
  navLinks: string[];
  textExcerpt: string;
}

export function extract(html: string, url: string): ExtractedPage {
  const $ = cheerio.load(html);

  const meta = (n: string) =>
    $(`meta[name="${n}"]`).attr('content') ||
    $(`meta[property="${n}"]`).attr('content') ||
    $(`meta[name="og:${n}"]`).attr('content') ||
    $(`meta[property="og:${n}"]`).attr('content') ||
    '';

  const title = $('title').first().text().trim() || meta('title');
  const hasViewport = !!$('meta[name="viewport"]').length;

  // Nav links
  const navLinks: string[] = [];
  $('nav a, header a, .header a, .nav a, [role="navigation"] a')
    .slice(0, 15)
    .each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text && text.length < 35 && !navLinks.includes(text)) {
        navLinks.push(text);
      }
    });

  // Hero section detection
  const heroEl = $('header, .hero, #hero, section:first-of-type, main > *:first-child').first();
  const heroHeadline = heroEl.find('h1, h2').first().text().replace(/\s+/g, ' ').trim();
  const heroSubheadline = heroEl.find('p').first().text().replace(/\s+/g, ' ').trim().slice(0, 200);

  // Remove scripts, styles, svg
  $('script, style, noscript, svg, iframe, canvas').remove();

  const list = (sel: string, max = 10) =>
    $(sel)
      .map((_, e) => $(e).text().replace(/\s+/g, ' ').trim())
      .get()
      .filter((t) => t && t.length < 160)
      .slice(0, max);

  // CTAs and buttons
  const ctaRe = /(get|start|try|book|buy|sign|contact|demo|free|quote|download|subscribe|join|request|call|order|shop|audit|learn|add to cart|checkout)/i;
  const ctas: string[] = [];
  const primaryButtons: string[] = [];

  $('a, button, [role="button"], input[type="submit"]').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim() || $(el).attr('value') || '';
    if (text.length > 1 && text.length < 60) {
      if (ctaRe.test(text) && !ctas.includes(text)) {
        ctas.push(text);
      }
      const isButton = el.tagName === 'button' || $(el).hasClass('btn') || $(el).hasClass('button') || $(el).attr('role') === 'button';
      if (isButton && !primaryButtons.includes(text)) {
        primaryButtons.push(text);
      }
    }
  });

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();

  // Pricing detection
  const pricingMatches = bodyText.match(/(?:[$€£₹]\s?\d+(?:[.,]\d{2})?|\b\d+\s?(?:USD|EUR|GBP|INR)\b|\b(?:free|pricing|per month|\/mo|\/yr|discount|\d+%\s*off)\b)/gi) || [];
  const uniquePricing = [...new Set(pricingMatches)].slice(0, 8);

  // Trust signals
  const trustRe = /\b(testimonial|review|rating|stars?|trusted by|customers?|guarantee|certified|award|case study|money back|verified|clients?|secure|refund|satisfaction)\b/gi;
  const trustSignals = [...new Set(bodyText.match(trustRe) || [])].slice(0, 10);

  // Form inputs
  const inputTypes: string[] = [];
  $('input:not([type=hidden]), textarea, select').each((_, el) => {
    const type = $(el).attr('type') || el.tagName.toLowerCase();
    if (!inputTypes.includes(type)) inputTypes.push(type);
  });

  // Images
  const totalImgs = $('img').length;
  const missingAlt = $('img:not([alt]), img[alt=""]').length;

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  try {
    const origin = new URL(url).origin;
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('http')) {
        if (href.startsWith(origin)) internalLinks++;
        else externalLinks++;
      } else if (href.startsWith('/') || href.startsWith('#')) {
        internalLinks++;
      }
    });
  } catch {}

  const hasPhoneOrEmail = /(\+?\d[\d\s().-]{8,}\d)|([\w.-]+@[\w.-]+\.\w+)/.test(bodyText);
  const words = bodyText.split(/\s+/).filter(Boolean);

  return {
    url,
    title,
    metaDescription: meta('description'),
    hasViewportMeta: hasViewport,
    h1: list('h1', 5),
    h2: list('h2', 12),
    h3: list('h3', 10),
    ctas: ctas.slice(0, 15),
    primaryButtons: primaryButtons.slice(0, 10),
    pricingMentions: uniquePricing,
    trustSignals,
    formsCount: $('form').length,
    inputCount: $('input:not([type=hidden]), textarea, select').length,
    inputTypes,
    imagesTotal: totalImgs,
    imagesMissingAlt: missingAlt,
    internalLinksCount: internalLinks,
    externalLinksCount: externalLinks,
    hasPhoneOrEmail,
    wordCount: words.length,
    heroHeadline: heroHeadline || (list('h1', 1)[0] ?? ''),
    heroSubheadline,
    navLinks,
    textExcerpt: bodyText.slice(0, 3500),
  };
}
