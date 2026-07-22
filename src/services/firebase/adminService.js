import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_ADMINS } from '../../models/rbacModel';

const ADMINS_COLLECTION = 'admins';
const LOCAL_ADMINS_KEY = 'borrow_admin_local_admins';

const getLocalAdmins = () => {
  const stored = localStorage.getItem(LOCAL_ADMINS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_ADMINS;
    }
  }
  localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(INITIAL_MOCK_ADMINS));
  return INITIAL_MOCK_ADMINS;
};

/**
 * Subscribe to Real-Time Admins Snapshot
 */
export const subscribeToAdmins = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, ADMINS_COLLECTION), orderBy('fullName', 'asc'));
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
          console.warn('Firestore admin snapshot error, using local fallback:', error);
          callback(getLocalAdmins());
        }
      );
    } catch (err) {
      console.warn('Firestore admin subscription failed:', err);
    }
  }

  callback(getLocalAdmins());
  return () => {};
};

/**
 * Create New Admin Profile
 */
export const createAdminProfile = async (payload) => {
  const newAdmin = {
    ...payload,
    status: payload.status || 'Active',
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, ADMINS_COLLECTION), newAdmin);
      return { id: docRef.id, ...newAdmin };
    } catch (err) {
      console.warn('Firestore add admin failed, using local fallback:', err);
    }
  }

  const current = getLocalAdmins();
  const created = { id: `ADM-${Date.now()}`, ...newAdmin };
  const updated = [created, ...current];
  localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(updated));
  return created;
};

/**
 * Update Admin Profile
 */
export const updateAdminRecord = async (id, payload) => {
  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, ADMINS_COLLECTION, id), payload);
    } catch (err) {
      console.warn('Firestore update admin failed:', err);
    }
  }

  const current = getLocalAdmins();
  const updated = current.map((a) => (a.id === id ? { ...a, ...payload } : a));
  localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(updated));
  return updated;
};

/**
 * Delete Admin Profile
 */
export const deleteAdminRecord = async (id) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, ADMINS_COLLECTION, id));
    } catch (err) {
      console.warn('Firestore delete admin failed:', err);
    }
  }

  const current = getLocalAdmins();
  const updated = current.filter((a) => a.id !== id);
  localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(updated));
  return true;
};
