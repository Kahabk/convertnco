import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:      import.meta.env.VITE_FIREBASE_API_KEY      || 'AIzaSyByRj4X_oq10SntNnZWiE3Qpib1kTnd6bM',
  // Keep the Firebase domain: this app is hosted on Vercel, not Firebase Hosting.
  // Branded email actions use VITE_APP_URL and /auth/action instead.
  authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN  || 'convertandco-2c145.firebaseapp.com',
  projectId:   import.meta.env.VITE_FIREBASE_PROJECT_ID   || 'convertandco-2c145',
  appId:       import.meta.env.VITE_FIREBASE_APP_ID       || '1:731205950878:web:c4c1d8bb2ff297dfce4a8f',
  storageBucket: 'convertandco-2c145.firebasestorage.app',
  messagingSenderId: '731205950878',
  measurementId: 'G-R9JTC4ERYE',
};

const appUrl = (import.meta.env.VITE_APP_URL || 'https://www.convertandco.com').replace(/\/+$/, '');

// Prevent duplicate app init (React StrictMode double-renders)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ── Auth helpers ──────────────────────────────────────────────────────
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export const signUpWithEmail = (email: string, password: string, displayName: string) =>
  createUserWithEmailAndPassword(auth, email, password).then(async (cred) => {
    await updateProfile(cred.user, { displayName });
    return cred;
  });

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email, {
    url: `${appUrl}/login`,
    handleCodeInApp: false,
  });

export const sendVerification = (user: User) =>
  sendEmailVerification(user, {
    url: `${appUrl}/admin`,
    handleCodeInApp: false,
  });

export type { User };
