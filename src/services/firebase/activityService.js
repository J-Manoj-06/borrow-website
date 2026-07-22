import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_ACTIVITIES } from '../../models/activityModel';

const ACTIVITIES_COLLECTION = 'activityLogs';
const LOCAL_ACTIVITIES_KEY = 'borrow_admin_local_activities';

const getLocalActivities = () => {
  const stored = localStorage.getItem(LOCAL_ACTIVITIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_ACTIVITIES;
    }
  }
  localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(INITIAL_MOCK_ACTIVITIES));
  return INITIAL_MOCK_ACTIVITIES;
};

/**
 * Subscribe to Real-Time Activity Logs Snapshot
 */
export const subscribeToActivityLogs = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, ACTIVITIES_COLLECTION), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(list);
        },
        (error) => {
          console.warn('Firestore activity log snapshot error, using local fallback:', error);
          callback(getLocalActivities());
        }
      );
    } catch (err) {
      console.warn('Firestore activity subscription failed:', err);
    }
  }

  callback(getLocalActivities());
  return () => {};
};

/**
 * Record Immutable Audit Trail Entry
 */
export const logActivityRecord = async (payload) => {
  const logEntry = {
    ...payload,
    status: payload.status || 'Success',
    ipAddress: payload.ipAddress || '192.168.1.45',
    device: payload.device || 'Chrome / Windows Desktop',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), logEntry);
      return { id: docRef.id, ...logEntry };
    } catch (err) {
      console.warn('Firestore log activity failed, using local fallback:', err);
    }
  }

  const current = getLocalActivities();
  const created = { id: `LOG-${Date.now()}`, ...logEntry };
  const updated = [created, ...current];
  localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(updated));
  return created;
};
