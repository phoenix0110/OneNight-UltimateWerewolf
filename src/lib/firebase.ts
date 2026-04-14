import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.projectId);
export const useEmulators = process.env.NEXT_PUBLIC_USE_EMULATORS === 'true';

let app: FirebaseApp | null = null;
if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app) : null;
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

// Guard against duplicate connections during HMR
const globalAny = globalThis as Record<string, boolean>;
if (useEmulators && !globalAny.__FIREBASE_EMULATORS_CONNECTED__) {
  globalAny.__FIREBASE_EMULATORS_CONNECTED__ = true;
  if (auth) connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  if (db) connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('[Firebase] Connected to local emulators');
}
