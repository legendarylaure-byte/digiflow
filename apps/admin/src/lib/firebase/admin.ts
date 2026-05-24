// Firebase Admin SDK init (server-side only)
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

let adminApp: App;
let adminDb: Firestore;
let adminStorage: Storage;

const adminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(adminConfig),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
} else {
  adminApp = getApps()[0];
}

adminDb = getFirestore(adminApp);
adminStorage = getStorage(adminApp);

// Set longer timeouts for admin operations
adminDb.settings({
  ignoreUndefinedProperties: true,
});

export { adminApp, adminDb, adminStorage };
