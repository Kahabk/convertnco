import { route, HttpError } from '../../_lib/http.js';
import { requireUser } from '../../_lib/auth.js';
import { sb, BUCKET } from '../../_lib/supabase.js';

async function sign(path?: string | null) {
  if (!path) return null;
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export default route(async (req, res) => {
  const user = await requireUser(req);
  const id = String(req.query.id);

  const { data: audit } = await sb.from('audits').select('*').eq('id', id).eq('user_id', user.uid).maybeSingle();
  if (!audit) throw new HttpError(404, 'Audit not found');

  const { data: pages } = await sb
    .from('audit_pages')
    .select('id,position,url,status,title,analysis,desktop_path,mobile_path,error')
    .eq('audit_id', id)
    .order('position');

  const withUrls = await Promise.all(
    (pages || []).map(async ({ desktop_path, mobile_path, ...p }) => ({
      ...p,
      desktopUrl: await sign(desktop_path),
      mobileUrl: await sign(mobile_path),
    }))
  );
  res.json({ audit, pages: withUrls });
});
