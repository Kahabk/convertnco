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
    });
    return { uid: payload.sub as string, email: (payload as any).email as string | undefined };
  } catch {
    throw new HttpError(401, 'Session expired, please sign in again');
  }
}
