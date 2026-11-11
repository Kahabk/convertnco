import { FormEvent, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  loginWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
} from '../lib/firebase';
import './Auth.css';

type AuthMode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const returnTo = params.get('returnTo') || '/cro-audit';
  const auditUrl = params.get('url');
  const destination = `${returnTo}${auditUrl ? `?url=${encodeURIComponent(auditUrl)}` : ''}`;
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clear = () => { setError(''); setSuccess(''); };
  const switchMode = (m: AuthMode) => { setMode(m); clear(); };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      if (mode === 'signup') {
        if (password !== confirm) throw new Error('Passwords do not match.');
        if (password.length < 6) throw new Error('Password must be at least 6 characters.');
        await signUpWithEmail(email, password, name);
        navigate(destination);
      } else if (mode === 'signin') {
        await signInWithEmail(email, password);
        navigate(destination);
      } else {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(friendlyError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    clear();
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(destination);
    } catch (err: any) {
      setError(friendlyError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <Link to="/" className="authLogo">
        <img src="/wight_logo.png" alt="Convert & Co" />
      </Link>

      <div className="authCard">
        {/* Header */}
        <div className="authHeader">
          <h1 className="authTitle">
            {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Reset password' : 'Welcome back'}
          </h1>
          <p className="authSub">
            {mode === 'signup'
              ? 'Sign up to run your free CRO audit'
              : mode === 'reset'
              ? "Enter your email and we'll send a reset link"
              : 'Sign in to access your CRO audits'}
          </p>
        </div>

        {/* Google button (not on reset mode) */}
        {mode !== 'reset' && (
          <>
            <button className="authGoogleBtn" onClick={handleGoogle} disabled={loading} type="button">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>

            <div className="authDivider"><span>or</span></div>
          </>
        )}

        {/* Form */}
        <form className="authForm" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <label className="authField">
              <span>Full name</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="authField">
            <span>Email address</span>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete={mode === 'signup' ? 'email' : 'username'}
            />
          </label>

          {mode !== 'reset' && (
            <label className="authField">
              <span>Password</span>
              <input
                type="password"
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </label>
          )}

          {mode === 'signup' && (
            <label className="authField">
              <span>Confirm password</span>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </label>
          )}

          {mode === 'signin' && (
            <div className="authForgot">
              <button type="button" className="authLinkBtn" onClick={() => switchMode('reset')}>
                Forgot password?
              </button>
            </div>
          )}

          {error && <p className="authError">{error}</p>}
          {success && <p className="authSuccess">{success}</p>}

          <button className="authSubmit" type="submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'signup'
              ? 'Create account'
              : mode === 'reset'
              ? 'Send reset link'
              : 'Sign in'}
          </button>
        </form>

        {/* Footer links */}
        <div className="authFooterLinks">
          {mode === 'signin' && (
            <p>
              Don't have an account?{' '}
              <button type="button" className="authLinkBtn" onClick={() => switchMode('signup')}>
                Sign up free
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button type="button" className="authLinkBtn" onClick={() => switchMode('signin')}>
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              <button type="button" className="authLinkBtn" onClick={() => switchMode('signin')}>
                ← Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>

      <p className="authDisclaimer">
        By continuing you agree to our{' '}
        <Link to="/terms-and-conditions">Terms & Conditions</Link>.
      </p>
    </div>
  );
}

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    'auth/operation-not-allowed': 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication → Sign-in method, or sign in with Google above.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Try again or reset it.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Sign-in window was closed. Please try again.',
    'auth/cancelled-popup-request': '',
    'auth/invalid-credential': 'Email or password is incorrect.',
  };
  return map[code] || code;
}
