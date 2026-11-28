import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VercelRequest } from '@vercel/node';
import { HttpError } from './http.js';

// Verifies the Firebase ID token without needing a service-account file.
const JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
);

export async function requireUser(req: VercelRequest) {
  const header = (req.headers.authorization as string) || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Please sign in');
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new HttpError(500, 'FIREBASE_PROJECT_ID missing');
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ['RS256'],
      clockTolerance: 5,
    });
    if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 128) {
      throw new Error('Invalid Firebase subject');
    }
    return {
      uid: payload.sub,
      email: (payload as any).email as string | undefined,
      emailVerified: Boolean((payload as any).email_verified),
    };
  } catch {
    throw new HttpError(401, 'Session expired, please sign in again');
  }
}

export async function requireAdmin(req: VercelRequest) {
  const user = await requireUser(req);
  const allowedEmail = (process.env.ADMIN_EMAIL || 'kahabhns@gmail.com').trim().toLowerCase();
  const expectedUid = process.env.ADMIN_FIREBASE_UID?.trim();
  const email = user.email?.trim().toLowerCase();

  if (!user.emailVerified) {
    throw new HttpError(403, 'Verify the admin email before continuing');
  }

  if (!email || email !== allowedEmail || (expectedUid && user.uid !== expectedUid)) {
    throw new HttpError(403, 'Admin access required');
  }

  return user;
}
