import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;

function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[firebase-admin] Missing credentials — Firestore writes in webhooks will fail');
    _app = initializeApp({ projectId: projectId || 'dummy' });
    return _app;
  }

  try {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (err) {
    console.warn('[firebase-admin] Failed to init with credentials, falling back:', err);
    _app = initializeApp({ projectId });
  }
  return _app;
}

export function getAdminDb(): Firestore {
  if (!_db) _db = getFirestore(getAdminApp());
  return _db;
}

/** @deprecated Use getAdminDb() instead — kept for backward compatibility */
export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    return Reflect.get(getAdminDb(), prop);
  },
});

export async function verifyIdToken(token: string): Promise<string | null> {
  try {
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
