import { route, HttpError } from '../_lib/http.js';
import { requireUser } from '../_lib/auth.js';
import { sb } from '../_lib/supabase.js';
import { assertSafeUrl } from '../_lib/safe-url.js';

export default route(async (req, res) => {
  const user = await requireUser(req);

  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('audits')
      .select('id,url,status,overall_score,created_at')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    return res.json({ audits: data });
  }

  if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');

  // Plans are server-owned. A missing plan is always Free, so a browser cannot
  // unlock Pro limits by changing client state.
  const { data: subscription, error: subscriptionError } = await sb
    .from('user_plans')
    .select('plan')
    .eq('user_id', user.uid)
    .maybeSingle();
  // Keep the audit endpoint available while an existing production database is
  // being migrated. Missing user_plans simply means every user is on Free.
  const missingPlansTable = subscriptionError?.code === '42P01' || subscriptionError?.code === 'PGRST205';
  if (subscriptionError && !missingPlansTable) throw subscriptionError;
  const plan = subscription?.plan === 'pro' ? 'pro' : 'free';
  const limit = plan === 'pro' ? 25 : 3;
  const maxPages = plan === 'pro' ? 15 : 1;
  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);
  const { count } = await sb
    .from('audits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.uid)
    .gte('created_at', dayStart.toISOString());
  if ((count ?? 0) >= limit) throw new HttpError(429, `${plan === 'pro' ? 'Pro' : 'Free'} limit reached (${limit} audits per day)`);

  const requestedUrls = Array.isArray(req.body?.urls) ? req.body.urls : [req.body?.url];
  const uniqueUrls: string[] = [...new Set<string>(requestedUrls.map((url: unknown) => String(url || '').trim()).filter(Boolean))];
  if (!uniqueUrls.length) throw new HttpError(400, 'Enter at least one website URL');
  if (uniqueUrls.length > maxPages) throw new HttpError(400, `${plan === 'pro' ? 'Pro' : 'Free'} supports up to ${maxPages} page${maxPages === 1 ? '' : 's'} per audit`);
  const urls = await Promise.all(uniqueUrls.map(async (url) => (await assertSafeUrl(url)).toString()));

  const { data: audit, error } = await sb
    .from('audits')
    .insert({ user_id: user.uid, user_email: user.email, url: urls[0] })
    .select('id')
    .single();
  if (error) throw error;

  const { error: e2 } = await sb
    .from('audit_pages')
    .insert(urls.map((url, i) => ({ audit_id: audit.id, position: i, url })));
  if (e2) throw e2;

  res.json({ id: audit.id, pages: urls.length });
});
