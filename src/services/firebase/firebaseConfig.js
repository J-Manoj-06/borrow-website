import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBtOs_rXt_e204yc6j7VCiiuemNbclhIM0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'uzhavusei-a8be3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'uzhavusei-a8be3',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'uzhavusei-a8be3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '792343486148',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:792343486148:web:053e896d01cb2124a67391',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-46TYVNPB00',
};

// Check if Firebase keys are real or placeholder
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'demo-api-key'
);

// Initialize Firebase App singleton safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore Offline Persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence is unsupported in this browser');
    }
  });
}

export default app;
