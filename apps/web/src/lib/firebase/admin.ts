import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function initAdmin() {
  if (!getApps().length) {
    if (!adminConfig.projectId || !adminConfig.clientEmail || !adminConfig.privateKey) {
      throw new Error('Firebase Admin credentials not configured');
    }
    app = initializeApp({
      credential: cert(adminConfig),
    });
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  return { app, db };
}

export function getAdminDb(): Firestore {
  if (!db) initAdmin();
  return db;
}

export function getAdminApp(): App {
  if (!app) initAdmin();
  return app;
}
