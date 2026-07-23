import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const ACTIVITIES_COLLECTION = 'activityLogs';

/**
  Subscribe to Real-Time Activity Logs Snapshot
 */
export const subscribeToActivityLogs = (callback) => {
  const q = query(collection(db, ACTIVITIES_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        time: docSnap.data().createdAt?.toDate?.() ? formatTimeAgo(docSnap.data().createdAt.toDate()) : 'Just now',
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
      }));
      callback(list);
    },
    (error) => {
      console.error('Firestore real-time activity subscription error:', error);
      callback([]);
    }
  );
};

/**
  Record Immutable Audit Trail Entry in Firestore
 */
export const logActivityRecord = async (payload) => {
  const logEntry = {
    ...payload,
    status: payload.status || 'Success',
    ipAddress: payload.ipAddress || '127.0.0.1',
    device: payload.device || 'Admin Dashboard Web',
    createdAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), logEntry);
    return { id: docRef.id, ...logEntry };
  } catch (err) {
    console.error('Firestore logActivityRecord failed:', err);
    return null;
  }
};

/**
  Helper for friendly time display
 */
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}
