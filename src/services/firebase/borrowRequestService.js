import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_REQUESTS, REQUEST_STATUSES } from '../../models/borrowRequestModel';
import addDays from 'date-fns/addDays';

const REQUESTS_COLLECTION = 'borrowRequests';
const NOTIFICATIONS_COLLECTION = 'notifications';
const LOCAL_REQUESTS_KEY = 'borrow_admin_local_requests';

/**
 * Fetch / Initialize Local Requests Fallback
 */
const getLocalRequests = () => {
  const stored = localStorage.getItem(LOCAL_REQUESTS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_REQUESTS;
    }
  }
  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(INITIAL_MOCK_REQUESTS));
  return INITIAL_MOCK_REQUESTS;
};

/**
 * Subscribe to Real-Time Borrow Requests Snapshot
 */
export const subscribeToBorrowRequests = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, REQUESTS_COLLECTION), orderBy('requestDate', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const requests = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(requests);
        },
        (error) => {
          console.warn('Firestore real-time subscription error, using local fallback:', error);
          callback(getLocalRequests());
        }
      );
    } catch (err) {
      console.warn('Firestore subscription failed, using local fallback:', err);
    }
  }

  // Fallback for dev mode
  const localData = getLocalRequests();
  callback(localData);

  // Return unsubscribe void function
  return () => {};
};

/**
 * Send Automated Notification to Student App via Firestore
 */
export const sendStudentNotification = async (studentId, title, body, metadata = {}) => {
  const notificationPayload = {
    studentId,
    title,
    body,
    metadata,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
        ...notificationPayload,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore notification write failed:', err);
    }
  }
};

/**
 * Approve Borrow Request with Duration Calculation
 */
export const approveBorrowRequest = async (requestId, durationDays, adminName = 'Lead Librarian') => {
  const now = new Date();
  let computedDueDate;

  if (typeof durationDays === 'number') {
    computedDueDate = addDays(now, durationDays).toISOString();
  } else {
    // Custom Date string
    computedDueDate = new Date(durationDays).toISOString();
  }

  const approvalHistoryEvent = {
    event: `Request Approved (${typeof durationDays === 'number' ? durationDays + ' Days' : 'Custom Due Date'})`,
    timestamp: now.toISOString(),
    actor: adminName,
  };

  if (isFirebaseConfigured) {
    try {
      const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, {
        status: REQUEST_STATUSES.APPROVED,
        approvedDate: now.toISOString(),
        dueDate: computedDueDate,
        approvedBy: adminName,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore approveBorrowRequest failed:', err);
    }
  }

  // Local state update fallback
  const localData = getLocalRequests();
  const updatedData = localData.map((req) => {
    if (req.id === requestId || req.requestId === requestId) {
      const updatedReq = {
        ...req,
        status: REQUEST_STATUSES.APPROVED,
        approvedDate: now.toISOString(),
        dueDate: computedDueDate,
        approvedBy: adminName,
        history: [...(req.history || []), approvalHistoryEvent],
        updatedAt: now.toISOString(),
      };

      // Dispatch notification
      sendStudentNotification(
        req.studentId,
        'Borrow Request Approved! 📚',
        `Your request for "${req.bookTitle}" has been approved. Please collect your copy from shelf by ${new Date(computedDueDate).toLocaleDateString()}.`,
        { requestId, status: 'Approved' }
      );

      return updatedReq;
    }
    return req;
  });

  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(updatedData));
  return updatedData.find((r) => r.id === requestId);
};

/**
 * Reject Borrow Request with Reason Logging
 */
export const rejectBorrowRequest = async (requestId, reason, adminName = 'Lead Librarian') => {
  const now = new Date();

  const rejectionHistoryEvent = {
    event: `Request Rejected (Reason: ${reason})`,
    timestamp: now.toISOString(),
    actor: adminName,
  };

  if (isFirebaseConfigured) {
    try {
      const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, {
        status: REQUEST_STATUSES.REJECTED,
        rejectedDate: now.toISOString(),
        rejectionReason: reason,
        approvedBy: adminName,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore rejectBorrowRequest failed:', err);
    }
  }

  // Local state update fallback
  const localData = getLocalRequests();
  const updatedData = localData.map((req) => {
    if (req.id === requestId || req.requestId === requestId) {
      const updatedReq = {
        ...req,
        status: REQUEST_STATUSES.REJECTED,
        rejectedDate: now.toISOString(),
        rejectionReason: reason,
        approvedBy: adminName,
        history: [...(req.history || []), rejectionHistoryEvent],
        updatedAt: now.toISOString(),
      };

      // Dispatch notification
      sendStudentNotification(
        req.studentId,
        'Borrow Request Update',
        `Your request for "${req.bookTitle}" was not approved. Reason: ${reason}`,
        { requestId, status: 'Rejected' }
      );

      return updatedReq;
    }
    return req;
  });

  localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(updatedData));
  return updatedData.find((r) => r.id === requestId);
};
