# Firebase authentication email branding

Production app URL: `https://www.convertandco.com`

The website is hosted on Vercel, not Firebase Hosting. Keep
`VITE_FIREBASE_AUTH_DOMAIN=convertandco-2c145.firebaseapp.com`. The Auth domain
controls Firebase's OAuth/helper infrastructure; the custom action URL and
email sender domain are configured separately.

## Firebase Console checklist

### Set the public-facing app name

1. Open Firebase Console and select `convertandco-2c145`.
2. Click the gear beside **Project Overview**, then **Project settings**.
3. Open **General** and scroll to **Public settings**.
4. Change **Public-facing name** from `project-731205950878` to `Convert & Co`.
5. Choose a monitored **Support email**, then save.
6. If the name still appears in Google sign-in, open **Authentication** →
   **Sign-in method** → **Google**, set **Public-facing name for project** to
   `Convert & Co`, choose the support email, and save.

### Add the production domain

1. Open **Build** → **Authentication**.
2. Open **Settings** → **Authorized domains**.
3. Click **Add domain**.
4. Add `www.convertandco.com`.
5. Repeat for `convertandco.com` if the apex domain redirects to or serves the
   website.

### Use the branded action page

1. Open **Build** → **Authentication** → **Templates**.
2. Open **Password reset** and click the pencil/edit icon.
3. Click **Customize action URL**.
4. Enter `https://www.convertandco.com/auth/action` and save.
5. Confirm the same custom action URL is shown for **Email address
   verification** and **Email address change**. Firebase applies the custom
   handler to the project's email action templates.

### Brand Firebase's built-in emails

1. In **Authentication** → **Templates**, open **Password reset** and click edit.
2. Set the sender name to `Convert & Co`.
3. Use a subject such as `Reset your Convert & Co password`.
4. Set **Reply-to** to a monitored inbox.
5. Click **Customize domain**, enter `convertandco.com`, and continue.
6. At the DNS provider, add every TXT and DKIM CNAME record Firebase displays.
   Copy names and values exactly. If an SPF TXT record already exists, merge
   Firebase's value into the existing SPF policy; do not publish two SPF
   records.
7. Wait for DNS propagation (Firebase says verification can take up to 24
   hours), return to the template, and click **Apply Custom Domain** after the
   green verification confirmation appears.
8. Repeat the template branding review for **Email address verification** and
   **Email address change**.

## Built-in email flow

The public forgot-password form uses Firebase's built-in
`sendPasswordResetEmail` with:

- Continue URL: `https://www.convertandco.com/login`
- `handleCodeInApp: false`
- Generic success text whether or not an account exists
- Custom handler: `https://www.convertandco.com/auth/action`

## Optional Resend Cloud Function

The `functions/` project provides `sendBrandedPasswordReset`. It uses Firebase
Admin to generate a valid reset code, rewrites the action URL onto the website,
and sends the supplied HTML/text template through Resend. It deliberately
returns the same response for every address and requires Firebase App Check.

1. In Resend, add and verify `convertandco.com`.
2. Publish the SPF and DKIM records Resend provides.
3. Upgrade Firebase to the Blaze plan if Cloud Functions deployment requires it.
4. Install and authenticate the CLI:

   ```bash
   npm install --global firebase-tools
   firebase login
   firebase use convertandco-2c145
   ```

5. Install and build the function:

   ```bash
   npm --prefix functions install
   npm --prefix functions run build
   ```

6. Store the Resend key in Secret Manager:

   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```

7. Deploy:

   ```bash
   firebase deploy --only functions:sendBrandedPasswordReset
   ```

8. Enable Firebase App Check for the web app before calling the function from
   the browser. Keep the built-in reset flow until App Check is enabled and the
   callable function is wired into the client.

To test the function locally, create `functions/.secret.local` containing a
test `RESEND_API_KEY`, then run:

```bash
npm --prefix functions run serve
```

Never commit `.secret.local`, `.env`, service-account JSON, or Resend API keys.

## Test the web action flow

### Local

1. Run `npm run dev`.
2. Open `http://localhost:3000/login`, choose **Forgot password?**, and submit
   an email.
3. For a real Firebase email, the configured action URL will still point to
   production. To test the UI locally, temporarily replace the hostname in a
   received action link with `http://localhost:3000`; keep its query string.
4. Confirm expired and reused links show a safe error.
5. Confirm the reset form rejects passwords without 8 characters, an uppercase
   letter, and one number.

### Production

1. Deploy the Vercel app and finish the Firebase Console steps above.
2. Request a reset from `https://www.convertandco.com/login`.
3. Confirm the sender name/domain, subject, reply-to, and action-link hostname.
4. Open the link, confirm the account email appears, and set a strong password.
5. Confirm the page redirects to `/login?reset=success` and the new password
   signs in.
6. Send an email verification and confirm it opens `/auth/action`, waits for a
   click, and then verifies the account.
7. Reuse each completed link and confirm it is rejected.
