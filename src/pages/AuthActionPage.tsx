import { FormEvent, useEffect, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import {
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import './Auth.css';

const logoImage = new URL('../../wight_logo.webp', import.meta.url).href;

type ActionMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail';
type PageState = 'checking' | 'ready' | 'submitting' | 'success' | 'error';

const ACTION_MODES = new Set<ActionMode>(['resetPassword', 'verifyEmail', 'recoverEmail']);

function actionError(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : '';
  const messages: Record<string, string> = {
    'auth/expired-action-code': 'This link has expired. Request a new email and try again.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',
    'auth/user-disabled': 'This account has been disabled. Contact support for help.',
    'auth/weak-password': 'Use at least 8 characters, one uppercase letter, and one number.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
  };
  return messages[code] || 'We could not complete this request. Please request a new email and try again.';
}

export default function AuthActionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const rawMode = params.get('mode');
  const mode = rawMode && ACTION_MODES.has(rawMode as ActionMode)
    ? rawMode as ActionMode
    : null;
  const oobCode = params.get('oobCode') || '';

  const [pageState, setPageState] = useState<PageState>('checking');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordIsStrong = Object.values(passwordRules).every(Boolean);

  useEffect(() => {
    let active = true;

    async function validateAction() {
      if (!mode || !oobCode) {
        setError('This action link is incomplete or invalid.');
        setPageState('error');
        return;
      }

      try {
        if (mode === 'resetPassword') {
          const accountEmail = await verifyPasswordResetCode(auth, oobCode);
          if (active) setEmail(accountEmail);
        } else {
          const info = await checkActionCode(auth, oobCode);
          if (active) setEmail(info.data.email || info.data.previousEmail || '');
        }
        if (active) setPageState('ready');
      } catch (validationError) {
        if (!active) return;
        setError(actionError(validationError));
        setPageState('error');
      }
    }

    void validateAction();
    return () => {
      active = false;
    };
  }, [mode, oobCode]);

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!passwordIsStrong) {
      setError('Use at least 8 characters, one uppercase letter, and one number.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setPageState('submitting');
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setPageState('success');
      window.setTimeout(() => navigate('/login?reset=success', { replace: true }), 1800);
    } catch (resetError) {
      setError(actionError(resetError));
      setPageState('ready');
    }
  }

  async function handleEmailAction() {
    setError('');
    setPageState('submitting');
    try {
      await applyActionCode(auth, oobCode);
      setPageState('success');
    } catch (applyError) {
      setError(actionError(applyError));
      setPageState('ready');
    }
  }

  const isReset = mode === 'resetPassword';
  const isVerification = mode === 'verifyEmail';
  const title = isReset
    ? 'Choose a new password'
    : isVerification
      ? 'Verify your email'
      : mode === 'recoverEmail'
        ? 'Restore your email'
        : 'Email action';

  return (
    <main className="authPage">
      <Helmet>
        <title>{title} | Convert &amp; Co</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <Link to="/" className="authLogo" aria-label="Convert & Co home">
        <img src={logoImage} alt="Convert & Co" width="200" height="250" />
      </Link>

      <section className="authCard authActionCard" aria-labelledby="auth-action-title">
        <div className="authHeader">
          <p className="authEyebrow">Secure account action</p>
          <h1 className="authTitle" id="auth-action-title">{title}</h1>
          {email && pageState !== 'success' && (
            <p className="authSub">Account: <strong>{email}</strong></p>
          )}
        </div>

        {pageState === 'checking' && (
          <div className="authActionStatus" role="status">
            <span className="authSpinner" aria-hidden="true" />
            <p>Checking your secure link…</p>
          </div>
        )}

        {pageState === 'error' && (
          <div className="authActionStack">
            <p className="authError" role="alert">{error}</p>
            <Link className="authSubmit authButtonLink" to="/login">Return to sign in</Link>
          </div>
        )}

        {isReset && (pageState === 'ready' || pageState === 'submitting') && (
          <form className="authForm" onSubmit={handlePasswordReset}>
            <label className="authField">
              <span>New password</span>
              <div className="authPasswordInput">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={pageState === 'submitting'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <label className="authField">
              <span>Confirm password</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={pageState === 'submitting'}
              />
            </label>

            <ul className="authPasswordRules" aria-label="Password requirements">
              <li data-valid={passwordRules.length}>At least 8 characters</li>
              <li data-valid={passwordRules.uppercase}>One uppercase letter</li>
              <li data-valid={passwordRules.number}>One number</li>
            </ul>

            {error && <p className="authError" role="alert">{error}</p>}
            <button className="authSubmit" type="submit" disabled={pageState === 'submitting'}>
              {pageState === 'submitting' ? 'Updating password…' : 'Update password'}
            </button>
          </form>
        )}

        {!isReset && pageState === 'ready' && (
          <div className="authActionStack">
            <p className="authActionCopy">
              {isVerification
                ? 'Confirm below to verify this email address. The link is not redeemed until you click.'
                : 'Confirm below to undo the email address change and restore your account email.'}
            </p>
            {error && <p className="authError" role="alert">{error}</p>}
            <button className="authSubmit" type="button" onClick={handleEmailAction}>
              {isVerification ? 'Verify email' : 'Restore email'}
            </button>
          </div>
        )}

        {!isReset && pageState === 'submitting' && (
          <div className="authActionStatus" role="status">
            <span className="authSpinner" aria-hidden="true" />
            <p>Completing your request…</p>
          </div>
        )}

        {pageState === 'success' && (
          <div className="authActionStack" role="status">
            <p className="authSuccess">
              {isReset
                ? 'Your password has been updated. Redirecting you to sign in…'
                : isVerification
                  ? 'Your email address is verified.'
                  : 'Your account email has been restored.'}
            </p>
            {!isReset && (
              <Link className="authSubmit authButtonLink" to="/login">Continue to sign in</Link>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
