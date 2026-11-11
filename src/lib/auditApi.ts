import { auth } from './firebase';

async function call(path: string, init: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const startAudit = (url: string | string[]) => call('/api/audits', {
  method: 'POST',
  body: JSON.stringify(Array.isArray(url) ? { urls: url } : { url }),
});
export const listAudits = () => call('/api/audits');
export const getAudit = (id: string) => call(`/api/audits/${id}`);
export const processNext = (id: string) => call(`/api/audits/${id}/process`, { method: 'POST' });
