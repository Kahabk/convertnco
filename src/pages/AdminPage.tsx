import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { listEnquiries, type Enquiry } from '../lib/enquiryApi';
import { logout, resetPassword, sendVerification, signInWithEmail } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import './AdminPage.css';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'kahabhns@gmail.com';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const hasAdminIdentity = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdmin = hasAdminIdentity && user?.emailVerified;

  const loadEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setEnquiries(await listEnquiries());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load enquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) void loadEnquiries();
  }, [isAdmin, loadEnquiries]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      await signInWithEmail(ADMIN_EMAIL, password);
      setPassword('');
    } catch (signInError: any) {
      const code = signInError?.code;
      setError(code === 'auth/invalid-credential' ? 'Incorrect admin password.' : 'Could not sign in. Check the admin account and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError('');
    setNotice('');
    try {
      await resetPassword(ADMIN_EMAIL);
      setNotice(`Password reset sent to ${ADMIN_EMAIL}.`);
    } catch {
      setError('Could not send the password reset email. Confirm that the admin account exists in Firebase.');
    }
  }

  async function handleVerification() {
    if (!user) return;
    setError('');
    setNotice('');
    try {
      await sendVerification(user);
      setNotice(`Verification email sent to ${ADMIN_EMAIL}. Open it, then sign in again.`);
    } catch {
      setError('Could not send a verification email. Wait a moment and try again.');
    }
  }

  async function handleLogout() {
    await logout();
    setEnquiries([]);
  }

  const pageHead = (
    <Helmet>
      <title>Enquiry Admin | Convert &amp; Co</title>
      <meta name="robots" content="noindex,nofollow" />
    </Helmet>
  );

  if (authLoading) {
    return <div className="adminLoading">{pageHead}<p>Checking admin session…</p></div>;
  }

  if (!user) {
    return (
      <main className="adminLoginPage">
        {pageHead}
        <Link className="adminBackLink" to="/">Convert &amp; Co</Link>
        <section className="adminLoginCard" aria-labelledby="admin-login-title">
          <p className="adminEyebrow">Private access</p>
          <h1 id="admin-login-title">Enquiry admin</h1>
          <p>Sign in to view responses submitted through the website contact form.</p>
          <form onSubmit={handleSignIn} className="adminLoginForm">
            <label>
              <span>Email</span>
              <input value={ADMIN_EMAIL} readOnly autoComplete="username" />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="current-password"
                placeholder="Enter admin password"
              />
            </label>
            {error && <p className="adminMessage adminError" role="alert">{error}</p>}
            {notice && <p className="adminMessage adminNotice" role="status">{notice}</p>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
            <button className="adminTextButton" type="button" onClick={handleResetPassword}>Reset password</button>
          </form>
        </section>
      </main>
    );
  }

  if (!hasAdminIdentity) {
    return (
      <main className="adminLoginPage">
        {pageHead}
        <section className="adminLoginCard">
          <p className="adminEyebrow">Access denied</p>
          <h1>Wrong account</h1>
          <p>This dashboard is restricted to {ADMIN_EMAIL}.</p>
          <button type="button" onClick={handleLogout}>Sign out</button>
        </section>
      </main>
    );
  }

  if (!user.emailVerified) {
    return (
      <main className="adminLoginPage">
        {pageHead}
        <section className="adminLoginCard">
          <p className="adminEyebrow">Verification required</p>
          <h1>Verify the admin email</h1>
          <p>For security, Firebase must verify {ADMIN_EMAIL} before enquiries can be opened.</p>
          {error && <p className="adminMessage adminError" role="alert">{error}</p>}
          {notice && <p className="adminMessage adminNotice" role="status">{notice}</p>}
          <button type="button" onClick={handleVerification}>Send verification email</button>
          <button className="adminTextButton" type="button" onClick={handleLogout}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="adminPage">
      {pageHead}
      <header className="adminHeader">
        <div>
          <p className="adminEyebrow">Convert &amp; Co</p>
          <h1>Enquiries</h1>
          <p>{enquiries.length} saved response{enquiries.length === 1 ? '' : 's'}</p>
        </div>
        <div className="adminHeaderActions">
          <button type="button" onClick={loadEnquiries} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
          <button type="button" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      {error && <p className="adminMessage adminError" role="alert">{error}</p>}

      {!loading && enquiries.length === 0 ? (
        <section className="adminEmpty">
          <h2>No enquiries yet</h2>
          <p>New contact-form responses will appear here automatically.</p>
        </section>
      ) : (
        <section className="adminEnquiryList" aria-label="Saved enquiry responses">
          {enquiries.map((enquiry) => (
            <article className="adminEnquiryCard" key={enquiry.id}>
              <header>
                <div>
                  <p className="adminEnquiryDate">{formatDate(enquiry.created_at)}</p>
                  <h2>{enquiry.name}</h2>
                  <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                </div>
                <span className="adminStatus">{enquiry.status}</span>
              </header>
              <dl className="adminEnquiryMeta">
                <div><dt>Company</dt><dd>{enquiry.company || 'Not provided'}</dd></div>
                <div><dt>Service</dt><dd>{enquiry.service || 'Not selected'}</dd></div>
                <div><dt>Budget</dt><dd>{enquiry.budget || 'Not provided'}</dd></div>
              </dl>
              <div className="adminEnquiryMessage">
                <h3>Project enquiry</h3>
                <p>{enquiry.message}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
