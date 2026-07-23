import {
  collection,
  doc,
  query,
  getDocs,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { TRANSACTION_STATUSES } from '../../models/transactionModel';
import { COPY_STATUSES } from '../../models/bookModel';
import { REQUEST_STATUSES } from '../../models/borrowRequestModel';
import { sendStudentNotification } from './borrowRequestService';
import { logActivityRecord } from './activityService';
import { syncBookCopyCounts } from './bookService';
import addDays from 'date-fns/addDays';
import isSameDay from 'date-fns/isSameDay';

const TRANSACTIONS_COLLECTION = 'transactions';
const BOOKS_COLLECTION = 'books';
const COPIES_COLLECTION = 'bookCopies';
const REQUESTS_COLLECTION = 'borrowRequests';

const MAX_RENEWAL_LIMIT = 2;

/**
  Subscribe to Real-Time Transactions Snapshot
 */
export const subscribeToTransactions = (callback) => {
  const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const now = new Date();
      const txns = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const dueDate = data.dueDate?.toDate?.()?.toISOString() || data.dueDate || null;
        const isOverdue = data.status === TRANSACTION_STATUSES.ISSUED && dueDate && new Date(dueDate) < now;
        const computedStatus = isOverdue ? 'Overdue' : data.status;

        return {
          id: docSnap.id,
          ...data,
          issueDate: data.issueDate?.toDate?.()?.toISOString() || data.issueDate || null,
          dueDate,
          returnDate: data.returnDate?.toDate?.()?.toISOString() || data.returnDate || null,
          computedStatus,
          isOverdue,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
        };
      });
      callback(txns);
    },
    (error) => {
      console.error('Firestore real-time transactions subscription error:', error);
      callback([]);
    }
  );
};

/**
  Issue Book Checkout using Atomic Firestore Transactions & Physical Copy Locking
 */
export const issueBookTransaction = async (issueData, adminName = 'Lead Librarian') => {
  const now = new Date();
  const txnId = `TXN-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  let computedDueDate = issueData.dueDate;
  if (!computedDueDate) {
    computedDueDate = addDays(now, 14).toISOString();
  }

  const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
  const bookRef = doc(db, BOOKS_COLLECTION, issueData.bookId);
  const copyRef = issueData.bookCopyId ? doc(db, COPIES_COLLECTION, issueData.bookCopyId) : null;
  const requestRef = issueData.requestId ? doc(db, REQUESTS_COLLECTION, issueData.requestId) : null;

  await runTransaction(db, async (transaction) => {
    // 1. Read book doc
    const bookSnap = await transaction.get(bookRef);
    if (!bookSnap.exists()) {
      throw new Error(`Book ID ${issueData.bookId} not found in catalog.`);
    }

    const bookData = bookSnap.data();
    if (bookData.isArchived) {
      throw new Error(`Cannot issue copy. Book title "${bookData.title}" is archived.`);
    }

    // 2. Read copy doc
    let targetCopyId = issueData.bookCopyId;
    if (copyRef) {
      const copySnap = await transaction.get(copyRef);
      if (!copySnap.exists()) {
        throw new Error(`Physical Copy ID ${issueData.bookCopyId} not found in inventory.`);
      }
      const copyData = copySnap.data();
      if (copyData.status === COPY_STATUSES.BORROWED) {
        throw new Error(`Physical Copy ${issueData.bookCopyId} is currently Borrowed by another student.`);
      }
      if (
        copyData.status === COPY_STATUSES.DAMAGED ||
        copyData.status === COPY_STATUSES.LOST ||
        copyData.status === COPY_STATUSES.ARCHIVED
      ) {
        throw new Error(`Physical Copy ${issueData.bookCopyId} is currently ${copyData.status} and cannot be issued.`);
      }
    }

    // 3. Create transaction record payload
    const transactionPayload = {
      transactionId: txnId,
      requestId: issueData.requestId || null,
      studentId: issueData.studentId,
      studentName: issueData.studentName,
      registerNumber: issueData.registerNumber || issueData.studentId,
      department: issueData.department || 'Computer Science',
      year: issueData.year || '3rd Year',
      studentAvatar: issueData.studentAvatar || null,
      bookId: issueData.bookId,
      bookCopyId: targetCopyId || `CPY-${issueData.bookId.slice(-4)}-001`,
      bookTitle: issueData.bookTitle || bookData.title,
      bookAuthor: issueData.bookAuthor || bookData.author || 'Library Collection',
      bookCoverUrl: issueData.bookCoverUrl || bookData.coverUrl || '',
      isbn: issueData.isbn || bookData.isbn || 'N/A',
      category: issueData.category || bookData.category || 'General',
      status: TRANSACTION_STATUSES.ISSUED,
      issueDate: now.toISOString(),
      dueDate: computedDueDate,
      returnDate: null,
      renewalCount: 0,
      condition: issueData.condition || 'Good',
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 4. Perform atomic writes
    transaction.set(transactionRef, transactionPayload);

    // Update physical copy status & active borrower
    if (copyRef) {
      transaction.update(copyRef, {
        status: COPY_STATUSES.BORROWED,
        currentTransactionId: transactionRef.id,
        currentBorrowerId: issueData.studentId,
        updatedAt: serverTimestamp(),
      });
    }

    // Update origin borrow request if linked
    if (requestRef) {
      transaction.update(requestRef, {
        status: 'Issued',
        issuedDate: now.toISOString(),
        updatedAt: serverTimestamp(),
      });
    }

    // Recalculate parent book inventory counts atomically
    await syncBookCopyCounts(transaction, issueData.bookId);
  });

  // Log activity & send notification
  await logActivityRecord({
    user: adminName,
    action: `issued physical copy ${issueData.bookCopyId || ''} to`,
    target: issueData.studentName,
    type: 'issue',
  });

  if (issueData.studentId) {
    await sendStudentNotification(
      issueData.studentId,
      'Book Issued Successfully! 📖',
      `You have collected "${issueData.bookTitle}" (Copy: ${issueData.bookCopyId || 'Assigned'}). Return deadline: ${new Date(computedDueDate).toLocaleDateString()}.`,
      { transactionId: transactionRef.id, status: 'Issued' }
    );
  }

  return { id: transactionRef.id, transactionId: txnId };
};

/**
  Process Returned Book with Condition Inspection (Good / Damaged / Lost) using Atomic Transactions
 */
export const returnBookTransaction = async (
  transactionId,
  returnCondition = 'Good',
  notes = '',
  adminName = 'Lead Librarian'
) => {
  const now = new Date();
  const txnRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  let targetStudentId = null;
  let targetBookTitle = null;

  await runTransaction(db, async (transaction) => {
    // 1. Read transaction doc
    const txnSnap = await transaction.get(txnRef);
    if (!txnSnap.exists()) {
      throw new Error(`Transaction ${transactionId} not found.`);
    }

    const txnData = txnSnap.data();
    targetStudentId = txnData.studentId;
    targetBookTitle = txnData.bookTitle;

    if (txnData.status === TRANSACTION_STATUSES.RETURNED) {
      throw new Error(`Book for transaction ${transactionId} has already been returned.`);
    }

    const returnHistoryEvent = {
      event: `Book Returned & Inspected (Condition: ${returnCondition})`,
      timestamp: now.toISOString(),
      actor: adminName,
      notes: notes || '',
    };

    // 2. Update transaction doc
    transaction.update(txnRef, {
      status: TRANSACTION_STATUSES.RETURNED,
      returnDate: now.toISOString(),
      condition: returnCondition,
      notes: notes || txnData.notes || '',
      returnedBy: adminName,
      history: [...(txnData.history || []), returnHistoryEvent],
      updatedAt: serverTimestamp(),
    });

    // 3. Update physical copy status & condition
    if (txnData.bookCopyId) {
      const copyRef = doc(db, COPIES_COLLECTION, txnData.bookCopyId);
      const copySnap = await transaction.get(copyRef);
      if (copySnap.exists()) {
        let finalCopyStatus = COPY_STATUSES.AVAILABLE;
        if (returnCondition === 'Damaged') finalCopyStatus = COPY_STATUSES.DAMAGED;
        if (returnCondition === 'Lost') finalCopyStatus = COPY_STATUSES.LOST;

        transaction.update(copyRef, {
          status: finalCopyStatus,
          condition: returnCondition,
          currentTransactionId: null,
          currentBorrowerId: null,
          notes: notes || '',
          updatedAt: serverTimestamp(),
        });
      }
    }

    // 4. Update origin request if linked
    if (txnData.requestId) {
      const reqRef = doc(db, REQUESTS_COLLECTION, txnData.requestId);
      const reqSnap = await transaction.get(reqRef);
      if (reqSnap.exists()) {
        transaction.update(reqRef, {
          status: 'Completed',
          updatedAt: serverTimestamp(),
        });
      }
    }

    // 5. Recalculate parent book inventory counts atomically
    if (txnData.bookId) {
      await syncBookCopyCounts(transaction, txnData.bookId);
    }
  });

  // Log activity & send notification
  await logActivityRecord({
    user: adminName,
    action: `processed return (Condition: ${returnCondition}) for`,
    target: targetBookTitle || 'Book',
    type: 'return',
  });

  if (targetStudentId) {
    await sendStudentNotification(
      targetStudentId,
      'Book Returned Successfully! ✅',
      `Thank you! "${targetBookTitle}" has been returned and checked into library inventory. Condition recorded: ${returnCondition}.`,
      { transactionId, status: 'Returned', condition: returnCondition }
    );
  }

  return true;
};

/**
  Renew Active Loan Transaction in Atomic Firestore Transaction
 */
export const renewBookTransaction = async (transactionId, extensionDays = 14, adminName = 'Lead Librarian') => {
  const now = new Date();
  const txnRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  let targetStudentId = null;
  let targetBookTitle = null;
  let newDueDate = null;

  await runTransaction(db, async (transaction) => {
    const txnSnap = await transaction.get(txnRef);
    if (!txnSnap.exists()) {
      throw new Error(`Transaction ${transactionId} not found.`);
    }

    const txnData = txnSnap.data();
    targetStudentId = txnData.studentId;
    targetBookTitle = txnData.bookTitle;

    if (txnData.status !== TRANSACTION_STATUSES.ISSUED) {
      throw new Error(`Only active loans (Issued) can be renewed.`);
    }

    const currentRenewals = Number(txnData.renewalCount || 0);
    if (currentRenewals >= MAX_RENEWAL_LIMIT) {
      throw new Error(`Maximum limit of ${MAX_RENEWAL_LIMIT} renewals reached for this loan.`);
    }

    // Check if there is a pending request queue for this book title
    if (txnData.bookId) {
      const queueQuery = query(
        collection(db, REQUESTS_COLLECTION),
        where('bookId', '==', txnData.bookId),
        where('status', '==', REQUEST_STATUSES.PENDING)
      );
      const queueSnap = await getDocs(queueQuery);
      if (!queueSnap.empty) {
        throw new Error(`Cannot renew loan. ${queueSnap.docs.length} student(s) are currently waiting in reservation queue for this book title.`);
      }
    }

    const currentDueDateObj = txnData.dueDate ? new Date(txnData.dueDate) : now;
    const baseDate = currentDueDateObj > now ? currentDueDateObj : now;
    newDueDate = addDays(baseDate, extensionDays).toISOString();

    const renewalHistoryEvent = {
      event: `Loan Renewed (+${extensionDays} Days, Renewal #${currentRenewals + 1})`,
      timestamp: now.toISOString(),
      actor: adminName,
    };

    transaction.update(txnRef, {
      dueDate: newDueDate,
      renewalCount: currentRenewals + 1,
      history: [...(txnData.history || []), renewalHistoryEvent],
      updatedAt: serverTimestamp(),
    });
  });

  if (targetStudentId) {
    await sendStudentNotification(
      targetStudentId,
      'Loan Renewed Successfully! 🔄',
      `Your loan for "${targetBookTitle}" has been extended by ${extensionDays} days. New return deadline: ${new Date(newDueDate).toLocaleDateString()}.`,
      { transactionId, dueDate: newDueDate }
    );
  }

  await logActivityRecord({
    user: adminName,
    action: `renewed loan (+${extensionDays} days) for`,
    target: targetBookTitle || transactionId,
    type: 'issue',
  });

  return { transactionId, newDueDate };
};

/**
  Fetch Return Reminders Categorization (Due Today, Due Tomorrow, Overdue)
 */
export const getReturnReminders = async () => {
  const now = new Date();
  const tomorrow = addDays(now, 1);

  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), where('status', '==', TRANSACTION_STATUSES.ISSUED));
    const snapshot = await getDocs(q);

    const dueToday = [];
    const dueTomorrow = [];
    const overdue = [];

    snapshot.docs.forEach((docSnap) => {
      const data = { id: docSnap.id, ...docSnap.data() };
      if (!data.dueDate) return;

      const dueObj = new Date(data.dueDate);

      if (dueObj < now) {
        overdue.push(data);
      } else if (isSameDay(dueObj, now)) {
        dueToday.push(data);
      } else if (isSameDay(dueObj, tomorrow)) {
        dueTomorrow.push(data);
      }
    });

    return { dueToday, dueTomorrow, overdue };
  } catch (err) {
    console.error('getReturnReminders failed:', err);
    return { dueToday: [], dueTomorrow: [], overdue: [] };
  }
};
