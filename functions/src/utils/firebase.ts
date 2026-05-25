import * as functions from 'firebase-functions';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let _app: App | undefined;
let _db: Firestore | undefined;
let _storage: Storage | undefined;

function init() {
  if (_app) return;
  const existing = getApps();
  if (existing.length) {
    _app = existing[0];
    _db = getFirestore(_app);
    _storage = getStorage(_app);
    return;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    _app = initializeApp({});
  }
  _db = getFirestore(_app);
  _db.settings({ ignoreUndefinedProperties: true });
  _storage = getStorage(_app);
}

const db = new Proxy({} as Firestore, {
  get(_, prop) {
    init();
    const val = (_db as any)[prop];
    return typeof val === 'function' ? val.bind(_db) : val;
  },
});

const storage = new Proxy({} as Storage, {
  get(_, prop) {
    init();
    const val = (_storage as any)[prop];
    return typeof val === 'function' ? val.bind(_storage) : val;
  },
});

export { _app as app, db, storage };
export const functionsConfig = functions.config();
