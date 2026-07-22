import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_TRANSACTIONS, TRANSACTION_STATUSES } from '../../models/transactionModel';
import { sendStudentNotification } from './borrowRequestService';
import addDays from 'date-fns/addDays';

const TRANSACTIONS_COLLECTION = 'transactions';
const BOOKS_COLLECTION = 'books';
const COPIES_COLLECTION = 'bookCopies';
const REQUESTS_COLLECTION = 'borrowRequests';
const LOCAL_TRANSACTIONS_KEY = 'borrow_admin_local_transactions';

const getLocalTransactions = () => {
  const stored = localStorage.getItem(LOCAL_TRANSACTIONS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MOCK_TRANSACTIONS;
    }
  }
  localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
  return INITIAL_MOCK_TRANSACTIONS;
};

/**
 * Subscribe to Real-Time Transactions Snapshot
 */
export const subscribeToTransactions = (callback) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          const txns = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          callback(txns);
        },
        (error) => {
          console.warn('Firestore transaction snapshot error, using local fallback:', error);
          callback(getLocalTransactions());
        }
      );
    } catch (err) {
      console.warn('Firestore transaction subscription failed:', err);
    }
  }

  const localData = getLocalTransactions();
  callback(localData);

  return () => {};
};

/**
 * Issue Book Checkout
 */
export const issueBookTransaction = async (issueData, adminName = 'Lead Librarian') => {
  const now = new Date();
  const txnId = `TXN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let computedDueDate = issueData.dueDate;
  if (!computedDueDate) {
    computedDueDate = addDays(now, 14).toISOString();
  }

  const transactionPayload = {
    transactionId: txnId,
    requestId: issueData.requestId || null,
    studentId: issueData.studentId,
    studentName: issueData.studentName,
    registerNumber: issueData.registerNumber,
    department: issueData.department || 'Computer Science',
    year: issueData.year || '3rd Year',
    studentAvatar: issueData.studentAvatar || null,
    bookId: issueData.bookId,
    bookCopyId: issueData.bookCopyId || `CPY-${issueData.bookId.slice(-4)}-001`,
    bookTitle: issueData.bookTitle,
    bookAuthor: issueData.bookAuthor || 'Library Collection',
    bookCoverUrl: issueData.bookCoverUrl || '',
    isbn: issueData.isbn || 'N/A',
    category: issueData.category || 'General',
    status: TRANSACTION_STATUSES.ISSUED,
    issueDate: now.toISOString(),
    dueDate: computedDueDate,
    returnDate: null,
    condition: 'Good',
    notes: issueData.notes || '',
    issuedBy: adminName,
    returnedBy: null,
    history: [
      {
        event: 'Book Issued to Student',
        timestamp: now.toISOString(),
        actor: adminName,
      },
    ],
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      // 1. Create Transaction Doc
      await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        ...transactionPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Update Copy Status in bookCopies collection
      if (issueData.bookCopyId) {
        const copyRef = doc(db, COPIES_COLLECTION, issueData.bookCopyId);
        await updateDoc(copyRef, {
          status: 'Borrowed',
          updatedAt: serverTimestamp(),
        });
      }

      // 3. Update Request Status if originating from request
      if (issueData.requestId) {
        const reqRef = doc(db, REQUESTS_COLLECTION, issueData.requestId);
        await updateDoc(reqRef, {
          status: 'Issued',
          issuedDate: now.toISOString(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Firestore issueBookTransaction failed:', err);
    }
  }

  // Local state persistence fallback
  const localData = getLocalTransactions();
  const updatedList = [{ id: txnId, ...transactionPayload }, ...localData];
  localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(updatedList));

  // Dispatch student push notification
  sendStudentNotification(
    issueData.studentId,
    'Book Issued Successfully! 📖',
    `You have collected "${issueData.bookTitle}" (Copy: ${transactionPayload.bookCopyId}). Return deadline: ${new Date(computedDueDate).toLocaleDateString()}.`,
    { transactionId: txnId, status: 'Issued' }
  );

  return { id: txnId, ...transactionPayload };
};

/**
 * Process Returned Book
 */
export const returnBookTransaction = async (
  transactionId,
  returnCondition = 'Good',
  notes = '',
  adminName = 'Lead Librarian'
) => {
  const now = new Date();

  const returnHistoryEvent = {
    event: `Book Returned (Condition: ${returnCondition})`,
    timestamp: now.toISOString(),
    actor: adminName,
  };

  if (isFirebaseConfigured) {
    try {
      const txnRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
      await updateDoc(txnRef, {
        status: TRANSACTION_STATUSES.RETURNED,
        returnDate: now.toISOString(),
        condition: returnCondition,
        notes: notes || '',
        returnedBy: adminName,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore returnBookTransaction failed:', err);
    }
  }

  // Local state update fallback
  const localData = getLocalTransactions();
  let targetStudentId = null;
  let targetBookTitle = null;

  const updatedData = localData.map((t) => {
    if (t.id === transactionId || t.transactionId === transactionId) {
      targetStudentId = t.studentId;
      targetBookTitle = t.bookTitle;

      return {
        ...t,
        status: TRANSACTION_STATUSES.RETURNED,
        returnDate: now.toISOString(),
        condition: returnCondition,
        notes: notes || t.notes,
        returnedBy: adminName,
        history: [...(t.history || []), returnHistoryEvent],
        updatedAt: now.toISOString(),
      };
    }
    return t;
  });

  localStorage.setItem(LOCAL_TRANSACTIONS_KEY, JSON.stringify(updatedData));

  // Dispatch student notification
  if (targetStudentId) {
    sendStudentNotification(
      targetStudentId,
      'Book Returned Successfully! ✅',
      `Thank you! "${targetBookTitle}" has been returned and checked into library inventory.`,
      { transactionId, status: 'Returned' }
    );
  }

  return updatedData.find((t) => t.id === transactionId);
};
