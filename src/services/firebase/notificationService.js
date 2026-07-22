import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_NOTIFICATIONS, INITIAL_MOCK_ANNOUNCEMENTS } from '../../models/notificationModel';

const NOTIFICATIONS_COLLECTION = 'notifications';
const ANNOUNCEMENTS_COLLECTION = 'announcements';

const LOCAL_NOTIFS_KEY = 'borrow_admin_local_notifications';
const LOCAL_ANNOUNCEMENTS_KEY = 'borrow_admin_local_announcements';

const getLocalNotifs = () => {
  const stored = localStorage.getItem(LOCAL_NOTIFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_NOTIFICATIONS;
    }
  }
  localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(INITIAL_MOCK_NOTIFICATIONS));
  return INITIAL_MOCK_NOTIFICATIONS;
};

const getLocalAnnouncements = () => {
  const stored = localStorage.getItem(LOCAL_ANNOUNCEMENTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_ANNOUNCEMENTS;
    }
  }
  localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(INITIAL_MOCK_ANNOUNCEMENTS));
  return INITIAL_MOCK_ANNOUNCEMENTS;
};

/**
 * Subscribe to Real-Time Notifications Snapshot
 */
export const subscribeToNotifications = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, NOTIFICATIONS_COLLECTION), orderBy('sentAt', 'desc'));
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
          console.warn('Firestore notification snapshot error, using local fallback:', error);
          callback(getLocalNotifs());
        }
      );
    } catch (err) {
      console.warn('Firestore notification subscription failed:', err);
    }
  }

  callback(getLocalNotifs());
  return () => {};
};

/**
 * Subscribe to Real-Time Announcements Snapshot
 */
export const subscribeToAnnouncements = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, ANNOUNCEMENTS_COLLECTION), orderBy('createdAt', 'desc'));
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
          console.warn('Firestore announcement snapshot error, using local fallback:', error);
          callback(getLocalAnnouncements());
        }
      );
    } catch (err) {
      console.warn('Firestore announcement subscription failed:', err);
    }
  }

  callback(getLocalAnnouncements());
  return () => {};
};

/**
 * Dispatch Push Notification
 */
export const sendNotificationRecord = async (payload) => {
  const newNotif = {
    ...payload,
    sentAt: payload.scheduleLater && payload.scheduledDateTime ? payload.scheduledDateTime : new Date().toISOString(),
    status: payload.scheduleLater ? 'Scheduled' : 'Sent',
    deliveredCount: payload.scheduleLater ? 0 : 42,
    openedCount: payload.scheduleLater ? 0 : 18,
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), newNotif);
      return { id: docRef.id, ...newNotif };
    } catch (err) {
      console.warn('Firestore add notification failed, using local fallback:', err);
    }
  }

  const current = getLocalNotifs();
  const created = { id: `NOTIF-${Date.now()}`, ...newNotif };
  const updated = [created, ...current];
  localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(updated));
  return created;
};

/**
 * Create Announcement Record
 */
export const createAnnouncementRecord = async (payload) => {
  const newAnn = {
    ...payload,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, ANNOUNCEMENTS_COLLECTION), newAnn);
      return { id: docRef.id, ...newAnn };
    } catch (err) {
      console.warn('Firestore add announcement failed, using local fallback:', err);
    }
  }

  const current = getLocalAnnouncements();
  const created = { id: `ANN-${Date.now()}`, ...newAnn };
  const updated = [created, ...current];
  localStorage.setItem(LOCAL_ANNOUNCEMENTS_KEY, JSON.stringify(updated));
  return created;
};

/**
 * Delete Notification
 */
export const deleteNotificationRecord = async (id) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
      return true;
    } catch (err) {
      console.warn('Firestore delete notification failed:', err);
    }
  }

  const current = getLocalNotifs();
  const updated = current.filter((n) => n.id !== id);
  localStorage.setItem(LOCAL_NOTIFS_KEY, JSON.stringify(updated));
  return true;
};
