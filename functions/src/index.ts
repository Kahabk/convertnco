import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { logger } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { onCall } from 'firebase-functions/v2/https';
import { Resend } from 'resend';
import { passwordResetEmail } from './email-template.js';

initializeApp();

const resendApiKey = defineSecret('RESEND_API_KEY');
const appBaseUrl = defineString('APP_BASE_URL', {
  default: 'https://www.convertandco.com',
});
const emailFrom = defineString('EMAIL_FROM', {
  default: 'Convert & Co <noreply@convertandco.com>',
});
const emailReplyTo = defineString('EMAIL_REPLY_TO', {
  default: 'hello.creativestudio@gmail.com',
});

type ResetRequest = {
  email?: unknown;
};

function brandedActionUrl(firebaseActionLink: string, baseUrl: string) {
  let source = new URL(firebaseActionLink);
  const nestedLink = source.searchParams.get('link');
  if (!source.searchParams.has('oobCode') && nestedLink) {
    source = new URL(nestedLink);
  }

  const branded = new URL('/auth/action', baseUrl);
  for (const key of ['mode', 'oobCode', 'apiKey', 'continueUrl', 'lang']) {
    const value = source.searchParams.get(key);
    if (value) branded.searchParams.set(key, value);
  }

  if (!branded.searchParams.has('oobCode')) {
    throw new Error('Firebase did not return an action code');
  }
  return branded.toString();
}

export const sendBrandedPasswordReset = onCall<ResetRequest>(
  {
    region: 'asia-south1',
    secrets: [resendApiKey],
    enforceAppCheck: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    cors: [
      'https://www.convertandco.com',
      'https://convertandco.com',
      'http://localhost:3000',
    ],
  },
  async (request) => {
    const email = typeof request.data.email === 'string'
      ? request.data.email.trim().toLowerCase()
      : '';

    // Always return the same response to prevent account enumeration.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: true };
    }

    try {
      const baseUrl = appBaseUrl.value().replace(/\/+$/, '');
      const firebaseLink = await getAuth().generatePasswordResetLink(email, {
        url: `${baseUrl}/login`,
        handleCodeInApp: false,
      });
      const actionUrl = brandedActionUrl(firebaseLink, baseUrl);
      const message = passwordResetEmail({ actionUrl, email });
      const resend = new Resend(resendApiKey.value());
      const { error } = await resend.emails.send({
        from: emailFrom.value(),
        replyTo: emailReplyTo.value(),
        to: email,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      logger.warn('Branded password reset email was not sent.', {
        reason: error instanceof Error ? error.name : 'unknown',
      });
    }

    return { ok: true };
  },
);
