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

const NOTIFICATIONS_COLLECTION = 'notifications';
const ANNOUNCEMENTS_COLLECTION = 'announcements';

/**
  Subscribe to Real-Time Notifications Snapshot
 */
export const subscribeToNotifications = (callback) => {
  const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy('sentAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        sentAt: docSnap.data().sentAt?.toDate?.()?.toISOString() || docSnap.data().sentAt || new Date().toISOString(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
      }));
      callback(list);
    },
    (error) => {
      console.error('Firestore real-time notifications subscription error:', error);
      callback([]);
    }
  );
};

/**
  Subscribe to Real-Time Announcements Snapshot
 */
export const subscribeToAnnouncements = (callback) => {
  const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('createdAt', 'desc'));
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
      console.error('Firestore real-time announcements subscription error:', error);
      callback([]);
    }
  );
};

/**
  Dispatch Push Notification in Firestore
 */
export const sendNotificationRecord = async (payload) => {
  const newNotif = {
    ...payload,
    sentAt: payload.scheduleLater && payload.scheduledDateTime ? payload.scheduledDateTime : new Date().toISOString(),
    status: payload.scheduleLater ? 'Scheduled' : 'Sent',
    deliveredCount: payload.scheduleLater ? 0 : 1,
    openedCount: 0,
    read: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotif);
  return { id: docRef.id, ...newNotif };
};

/**
  Create Announcement Record in Firestore
 */
export const createAnnouncementRecord = async (payload) => {
  const newAnn = {
    ...payload,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), newAnn);
  return { id: docRef.id, ...newAnn };
};

/**
  Delete Notification from Firestore
 */
export const deleteNotificationRecord = async (id) => {
  await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
  return true;
};

/**
  Mark Notification as Read in Firestore
 */
export const markNotificationRead = async (id) => {
  const ref = doc(db, NOTIFICATIONS_COLLECTION, id);
  await updateDoc(ref, {
    read: true,
    updatedAt: serverTimestamp(),
  });
  return true;
};
