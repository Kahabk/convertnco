import { route, HttpError } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { sb, BUCKET } from '../../_lib/supabase.js';
import { renderedHtml, screenshot } from '../../_lib/browser.js';
import { extract } from '../../_lib/extract.js';
import { analyzePage } from '../../_lib/ai.js';
import { assertSafeUrl } from '../../_lib/safe-url.js';

const isTemporaryAiLimit = (error: unknown) => /Gemini\s+429|OpenRouter\s+429|resource.?exhausted|rate.?limit/i.test(String((error as Error)?.message || error));
const isExhaustedAiQuota = (error: unknown) => /exceeded your current quota|plan and billing|quota has been exhausted/i.test(String((error as Error)?.message || error));

/**
 * The browser calls this repeatedly. Each call processes ONE page (fits in a serverless time limit),
 * or finalizes the audit when no pages are left. No queue / Redis / worker needed.
 */
export default route(async (req, res) => {
  if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
  const user = await requireUser(req);
  const id = String(req.query.id);

  const { data: audit } = await sb.from('audits').select('*').eq('id', id).eq('user_id', user.uid).maybeSingle();
  if (!audit) throw new HttpError(404, 'Audit not found');
  if (audit.status !== 'processing') return res.json({ done: true });

  // next pending page
  const { data: next } = await sb
    .from('audit_pages').select('*').eq('audit_id', id).eq('status', 'pending')
    .order('position').limit(1).maybeSingle();

  if (!next) return res.json({ done: await finalize(audit) });

  // claim it (prevents double-processing)
  const { data: claimed } = await sb
    .from('audit_pages').update({ status: 'processing' }).eq('id', next.id).eq('status', 'pending').select('id');
  if (!claimed?.length) return res.json({ done: false });

  try {
    await assertSafeUrl(next.url);
    const html = await renderedHtml(next.url);
    const extracted = extract(html, next.url);

    // Capture once, then reuse the same images for visual AI analysis and UI previews.
    let desktop: Buffer | null = null;
    let mobile: Buffer | null = null;
    try {
      [desktop, mobile] = await Promise.all([
        screenshot(next.url, 'desktop'),
        screenshot(next.url, 'mobile'),
      ]);
    } catch (shotErr) {
      console.warn('Screenshot generation warning for', next.url, shotErr);
    }

    // Only send to AI if under 600KB to prevent vision gateway timeouts; full resolution is preserved for Supabase Storage uploads.
    const aiImages = [
      ...(desktop && desktop.length > 1000 && desktop.length < 600_000 ? [{ mime: 'image/jpeg', b64: desktop.toString('base64'), label: 'desktop' }] : []),
      ...(mobile && mobile.length > 1000 && mobile.length < 600_000 ? [{ mime: 'image/jpeg', b64: mobile.toString('base64'), label: 'mobile' }] : []),
    ];
    const analysis = await analyzePage(extracted, aiImages);

    // Upload the same captures for the authenticated results view.
    let desktopPath: string | null = null;
    let mobilePath: string | null = null;
    try {
      const base = `${user.uid}/${id}/${next.id}`;
      const uploads: Promise<any>[] = [];

      if (desktop && desktop.length > 1000) {
        uploads.push(
          sb.storage.from(BUCKET).upload(`${base}-desktop.jpg`, desktop, { contentType: 'image/jpeg', upsert: true }).then(() => {
            desktopPath = `${base}-desktop.jpg`;
          }).catch((err) => console.warn('Supabase desktop upload warning:', err))
        );
      }

      if (mobile && mobile.length > 1000) {
        uploads.push(
          sb.storage.from(BUCKET).upload(`${base}-mobile.jpg`, mobile, { contentType: 'image/jpeg', upsert: true }).then(() => {
            mobilePath = `${base}-mobile.jpg`;
          }).catch((err) => console.warn('Supabase mobile upload warning:', err))
        );
      }

      await Promise.all(uploads);
    } catch (shotErr) {
      console.warn('Screenshot generation warning for', next.url, shotErr);
    }

    await sb.from('audit_pages').update({
      status: 'done',
      title: extracted.title,
      extracted,
      analysis,
      desktop_path: desktopPath,
      mobile_path: mobilePath,
    }).eq('id', next.id);
  } catch (e: any) {
    // A billing/quota-exhausted response will not recover with a short retry.
    // Surface a concise actionable error rather than leaving an audit running forever.
    if (isExhaustedAiQuota(e)) {
      console.warn('AI provider quota is exhausted:', next.url);
      await sb.from('audit_pages').update({
        status: 'error',
        error: 'AI analysis quota is currently unavailable. Configure an AI provider with available quota, then run a new audit.',
      }).eq('id', next.id);
    } else
    // Gemini/OpenRouter free tiers can throttle briefly. Keep the job pending so
    // the authenticated client can retry it instead of permanently failing a page.
    if (isTemporaryAiLimit(e)) {
      console.warn('AI provider rate-limited; audit will retry shortly:', next.url);
      await sb.from('audit_pages').update({ status: 'pending', error: null }).eq('id', next.id);
      return res.json({ done: false, retrying: true, retryAfterMs: 15000 });
    } else {
      console.error('page failed', next.url, e);
      await sb.from('audit_pages').update({ status: 'error', error: String(e.message || e).slice(0, 300) }).eq('id', next.id);
    }
  }

  const { count } = await sb
    .from('audit_pages').select('id', { count: 'exact', head: true }).eq('audit_id', id).eq('status', 'pending');
  res.json({ done: false, remaining: count ?? 0 });
});

async function finalize(audit: any): Promise<boolean> {
  const { data: pages } = await sb.from('audit_pages').select('url,analysis,status').eq('audit_id', audit.id);
  const ok = (pages || []).filter((p) => p.status === 'done' && p.analysis);

  if (!ok.length) {
    await sb.from('audits').update({ status: 'failed', error: 'No pages could be analyzed' }).eq('id', audit.id);
    return true;
  }
  const scores = ok.map((p) => Number(p.analysis.score) || 0);
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const firstAnalysis = ok[0]?.analysis;
  const summary = firstAnalysis ? {
    executive_summary: `Audit complete with an overall CRO score of ${overall}/100. We identified ${firstAnalysis.findings?.length || 0} key conversion opportunities to boost engagement and reduce drop-off.`,
    top_priorities: (firstAnalysis.findings || []).slice(0, 4).map((f: any) => ({
      title: f.issue,
      why: f.recommendation,
      effort: f.severity === 'high' ? 'medium' : 'low',
      impact: f.severity === 'high' ? 'high' : 'medium',
    })),
    quick_wins: firstAnalysis.quick_wins || []
  } : null;

  await sb.from('audits').update({
    status: 'complete',
    overall_score: overall,
    summary,
    completed_at: new Date().toISOString(),
  }).eq('id', audit.id);
  return true;
}
