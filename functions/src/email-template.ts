type PasswordResetEmailInput = {
  actionUrl: string;
  email: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function passwordResetEmail({ actionUrl, email }: PasswordResetEmailInput) {
  const safeActionUrl = escapeHtml(actionUrl);
  const safeEmail = escapeHtml(email);

  return {
    subject: 'Reset your Convert & Co password',
    text: [
      'Reset your Convert & Co password',
      '',
      `We received a password reset request for ${email}.`,
      'Open the secure link below to choose a new password:',
      actionUrl,
      '',
      'This link expires automatically. If you did not request this, you can safely ignore this email.',
      '',
      'Convert & Co',
    ].join('\n'),
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset your Convert &amp; Co password</title>
  </head>
  <body style="margin:0;background:#080808;color:#f5f3ef;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:36px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#111111;border:1px solid #292929;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:38px 40px 12px;">
                <p style="margin:0;color:#888888;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Convert &amp; Co</p>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 40px 40px;">
                <h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;line-height:1.15;color:#f5f3ef;">Choose a new password</h1>
                <p style="margin:0 0 12px;color:#b7b7b7;font-size:16px;line-height:1.65;">We received a password reset request for <strong style="color:#f5f3ef;">${safeEmail}</strong>.</p>
                <p style="margin:0 0 28px;color:#b7b7b7;font-size:16px;line-height:1.65;">Use the secure button below to create a new password.</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:10px;background:#f5f3ef;">
                      <a href="${safeActionUrl}" style="display:inline-block;padding:14px 22px;color:#090909;font-size:15px;font-weight:700;text-decoration:none;">Reset password</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:28px 0 0;color:#777777;font-size:13px;line-height:1.6;">This one-time link expires automatically. If you did not request this change, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #242424;padding:22px 40px;color:#666666;font-size:12px;line-height:1.5;">Convert &amp; Co · Kerala, India</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
