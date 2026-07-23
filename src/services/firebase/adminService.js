import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { logActivityRecord } from './activityService';

const ADMINS_COLLECTION = 'admins';

/**
  Subscribe to Real-Time Admins Snapshot
 */
export const subscribeToAdmins = (callback) => {
  const q = query(collection(db, ADMINS_COLLECTION), orderBy('fullName', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
      }));
      callback(list);
    },
    (error) => {
      console.error('Firestore real-time admin subscription error:', error);
      callback([]);
    }
  );
};

/**
  Create New Admin Profile in Firestore
 */
export const createAdminProfile = async (payload) => {
  const newAdmin = {
    ...payload,
    status: payload.status || 'Active',
    lastLogin: new Date().toISOString(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ADMINS_COLLECTION), newAdmin);

  await logActivityRecord({
    user: 'System Admin',
    action: 'created admin account for',
    target: payload.fullName || payload.email,
    type: 'add',
  });

  return { id: docRef.id, ...newAdmin };
};

/**
  Update Admin Profile in Firestore
 */
export const updateAdminRecord = async (id, payload) => {
  const adminRef = doc(db, ADMINS_COLLECTION, id);
  await updateDoc(adminRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
  return true;
};

/**
  Delete Admin Profile from Firestore
 */
export const deleteAdminRecord = async (id) => {
  await deleteDoc(doc(db, ADMINS_COLLECTION, id));
  await logActivityRecord({
    user: 'System Admin',
    action: 'revoked admin account',
    target: id,
    type: 'delete',
  });
  return true;
};
