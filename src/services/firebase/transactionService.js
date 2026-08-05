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
import { COPY_STATUSES, BOOK_STATUSES } from '../../models/bookModel';
import { REQUEST_STATUSES } from '../../models/borrowRequestModel';
import { sendStudentNotification } from './borrowRequestService';
import { logActivityRecord } from './activityService';
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
  Issue Book Checkout using Atomic Firestore Transactions & Physical Copy Locking.

  Read order (ALL reads before ANY write):
    1. Read book doc
    2. Read copy doc (if bookCopyId supplied)
    3. Read request doc (if requestId supplied)
    4. Read all book copies for inventory count sync
    5. Read book doc again for syncBookCopyCounts status calculation
  Write order:
    6. Create transaction doc
    7. Update physical copy status
    8. Update origin request (if linked)
    9. Update parent book inventory counts
 */
export const issueBookTransaction = async (issueData, adminName = 'Lead Librarian') => {
  const now = new Date();
  const txnId = `TXN-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  let computedDueDate = issueData.dueDate;
  if (!computedDueDate) {
    computedDueDate = addDays(now, 14).toISOString();
  }

  const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));
  const bookRef        = doc(db, BOOKS_COLLECTION, issueData.bookId);
  const copyRef        = issueData.bookCopyId ? doc(db, COPIES_COLLECTION, issueData.bookCopyId) : null;
  const requestRef     = issueData.requestId  ? doc(db, REQUESTS_COLLECTION, issueData.requestId) : null;

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

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
    let copySnap = null;
    if (copyRef) {
      copySnap = await transaction.get(copyRef);
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

    // 3. Read request doc (if linked)
    let reqSnap = null;
    if (requestRef) {
      reqSnap = await transaction.get(requestRef);
    }

    // 4. Read all book copies so we can sync inventory counts without a post-write read
    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', issueData.bookId));
    const copiesSnap  = await getDocs(copiesQuery);

    // ── PHASE 2: COMPUTE COUNTS (pure logic, no Firestore calls) ──────────

    let availableCopies   = 0;
    let borrowedCopies    = 0;
    let reservedCopies    = 0;
    let damagedCopies     = 0;
    let lostCopies        = 0;
    let archivedCopies    = 0;
    let maintenanceCopies = 0;
    let totalCopies       = 0;

    copiesSnap.docs.forEach((d) => {
      const c = d.data();
      // Apply the pending write: the target copy will become BORROWED
      const effectiveStatus = (copyRef && d.id === copyRef.id) ? COPY_STATUSES.BORROWED : c.status;

      if (effectiveStatus === COPY_STATUSES.ARCHIVED) {
        archivedCopies += 1;
      } else {
        totalCopies += 1;
        if (effectiveStatus === COPY_STATUSES.AVAILABLE)  availableCopies   += 1;
        if (effectiveStatus === COPY_STATUSES.BORROWED)   borrowedCopies    += 1;
        if (effectiveStatus === COPY_STATUSES.RESERVED)   reservedCopies    += 1;
        if (effectiveStatus === COPY_STATUSES.DAMAGED)    damagedCopies     += 1;
        if (effectiveStatus === COPY_STATUSES.LOST)       lostCopies        += 1;
        if (effectiveStatus === COPY_STATUSES.MAINTENANCE) maintenanceCopies += 1;
      }
    });

    let bookStatus = BOOK_STATUSES.AVAILABLE;
    if (bookData.isArchived) {
      bookStatus = BOOK_STATUSES.ARCHIVED;
    } else if (availableCopies > 0) {
      bookStatus = BOOK_STATUSES.AVAILABLE;
    } else if (borrowedCopies > 0 || reservedCopies > 0) {
      bookStatus = BOOK_STATUSES.OUT_OF_STOCK;
    } else {
      bookStatus = BOOK_STATUSES.UNAVAILABLE;
    }

    // ── PHASE 3: ALL WRITES ───────────────────────────────────────────────

    // 5. Create transaction record
    const transactionPayload = {
      transactionId: txnId,
      requestId:     issueData.requestId || null,
      studentId:     issueData.studentId,
      studentName:   issueData.studentName,
      registerNumber: issueData.registerNumber || issueData.studentId,
      department:    issueData.department || 'Computer Science',
      year:          issueData.year || '3rd Year',
      studentAvatar: issueData.studentAvatar || null,
      bookId:        issueData.bookId,
      bookCopyId:    targetCopyId || `CPY-${issueData.bookId.slice(-4)}-001`,
      bookTitle:     issueData.bookTitle || bookData.title,
      bookAuthor:    issueData.bookAuthor || bookData.author || 'Library Collection',
      bookCoverUrl:  issueData.bookCoverUrl || bookData.coverUrl || '',
      isbn:          issueData.isbn || bookData.isbn || 'N/A',
      category:      issueData.category || bookData.category || 'General',
      status:        TRANSACTION_STATUSES.ISSUED,
      issueDate:     now.toISOString(),
      dueDate:       computedDueDate,
      returnDate:    null,
      renewalCount:  0,
      condition:     issueData.condition || 'Good',
      notes:         issueData.notes || '',
      issuedBy:      adminName,
      returnedBy:    null,
      history: [
        {
          event:     'Book Issued to Student',
          timestamp: now.toISOString(),
          actor:     adminName,
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    transaction.set(transactionRef, transactionPayload);

    // 6. Update physical copy status
    if (copyRef) {
      transaction.update(copyRef, {
        status:               COPY_STATUSES.BORROWED,
        currentTransactionId: transactionRef.id,
        currentBorrowerId:    issueData.studentId,
        updatedAt:            serverTimestamp(),
      });
    }

    // 7. Update origin borrow request (if linked)
    if (requestRef && reqSnap && reqSnap.exists()) {
      transaction.update(requestRef, {
        status:     'Issued',
        issuedDate: now.toISOString(),
        updatedAt:  serverTimestamp(),
      });
    }

    // 8. Update parent book inventory counts (no reads needed — counts computed above)
    transaction.update(bookRef, {
      totalCopies,
      availableCopies,
      borrowedCopies,
      reservedCopies,
      damagedCopies,
      lostCopies,
      archivedCopies,
      maintenanceCopies,
      status: bookStatus,
      updatedAt: serverTimestamp(),
    });
  });

  // Post-transaction: activity log & notification (outside runTransaction — safe)
  await logActivityRecord({
    user:   adminName,
    action: `issued physical copy ${issueData.bookCopyId || ''} to`,
    target: issueData.studentName,
    type:   'issue',
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
  Process Returned Book with Condition Inspection (Good / Damaged / Lost).

  Read order (ALL reads before ANY write):
    1. Read transaction doc
    2. Read copy doc (using bookCopyId from transaction)
    3. Read request doc (if requestId on transaction)
    4. Read all book copies for inventory count sync
  Write order:
    5. Update transaction doc
    6. Update physical copy
    7. Update request (if linked)
    8. Update parent book inventory counts
 */
export const returnBookTransaction = async (
  transactionId,
  returnCondition = 'Good',
  notes = '',
  adminName = 'Lead Librarian'
) => {
  const now    = new Date();
  const txnRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  let targetStudentId = null;
  let targetBookTitle = null;

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

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

    // 2. Read copy doc
    let copySnap = null;
    let copyRef  = null;
    if (txnData.bookCopyId) {
      copyRef  = doc(db, COPIES_COLLECTION, txnData.bookCopyId);
      copySnap = await transaction.get(copyRef);
    }

    // 3. Read origin request doc (if linked)
    let reqSnap = null;
    let reqRef  = null;
    if (txnData.requestId) {
      reqRef  = doc(db, REQUESTS_COLLECTION, txnData.requestId);
      reqSnap = await transaction.get(reqRef);
    }

    // 4. Read all book copies for inventory count sync
    let copiesSnap = null;
    if (txnData.bookId) {
      const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', txnData.bookId));
      copiesSnap = await getDocs(copiesQuery);
    }

    // ── PHASE 2: COMPUTE COUNTS ───────────────────────────────────────────

    let finalCopyStatus = COPY_STATUSES.AVAILABLE;
    if (returnCondition === 'Damaged') finalCopyStatus = COPY_STATUSES.DAMAGED;
    if (returnCondition === 'Lost')    finalCopyStatus = COPY_STATUSES.LOST;

    let availableCopies   = 0;
    let borrowedCopies    = 0;
    let reservedCopies    = 0;
    let damagedCopies     = 0;
    let lostCopies        = 0;
    let archivedCopies    = 0;
    let maintenanceCopies = 0;
    let totalCopies       = 0;
    let bookStatusResult  = BOOK_STATUSES.AVAILABLE;

    if (copiesSnap) {
      copiesSnap.docs.forEach((d) => {
        const c = d.data();
        // Apply the pending write: the returned copy will transition to finalCopyStatus
        const effectiveStatus = (copyRef && d.id === copyRef.id) ? finalCopyStatus : c.status;

        if (effectiveStatus === COPY_STATUSES.ARCHIVED) {
          archivedCopies += 1;
        } else {
          totalCopies += 1;
          if (effectiveStatus === COPY_STATUSES.AVAILABLE)   availableCopies   += 1;
          if (effectiveStatus === COPY_STATUSES.BORROWED)    borrowedCopies    += 1;
          if (effectiveStatus === COPY_STATUSES.RESERVED)    reservedCopies    += 1;
          if (effectiveStatus === COPY_STATUSES.DAMAGED)     damagedCopies     += 1;
          if (effectiveStatus === COPY_STATUSES.LOST)        lostCopies        += 1;
          if (effectiveStatus === COPY_STATUSES.MAINTENANCE) maintenanceCopies += 1;
        }
      });

      // Determine parent book status based on resulting inventory
      // We read the book data from the txnRef (we already have bookId, and we need the isArchived flag).
      // Read the book doc to get isArchived — still within read phase since we haven't written yet.
      const bookRef  = doc(db, BOOKS_COLLECTION, txnData.bookId);
      const bookSnap = await transaction.get(bookRef);
      const isArchived = bookSnap.exists() ? Boolean(bookSnap.data().isArchived) : false;

      if (isArchived) {
        bookStatusResult = BOOK_STATUSES.ARCHIVED;
      } else if (availableCopies > 0) {
        bookStatusResult = BOOK_STATUSES.AVAILABLE;
      } else if (borrowedCopies > 0 || reservedCopies > 0) {
        bookStatusResult = BOOK_STATUSES.OUT_OF_STOCK;
      } else {
        bookStatusResult = BOOK_STATUSES.UNAVAILABLE;
      }

      // ── PHASE 3: ALL WRITES ─────────────────────────────────────────────

      const returnHistoryEvent = {
        event:  `Book Returned & Inspected (Condition: ${returnCondition})`,
        timestamp: now.toISOString(),
        actor:  adminName,
        notes:  notes || '',
      };

      // 5. Update transaction doc
      transaction.update(txnRef, {
        status:     TRANSACTION_STATUSES.RETURNED,
        returnDate: now.toISOString(),
        condition:  returnCondition,
        notes:      notes || txnData.notes || '',
        returnedBy: adminName,
        history:    [...(txnData.history || []), returnHistoryEvent],
        updatedAt:  serverTimestamp(),
      });

      // 6. Update physical copy
      if (copyRef && copySnap && copySnap.exists()) {
        transaction.update(copyRef, {
          status:               finalCopyStatus,
          condition:            returnCondition,
          currentTransactionId: null,
          currentBorrowerId:    null,
          notes:                notes || '',
          updatedAt:            serverTimestamp(),
        });
      }

      // 7. Update origin request (if linked)
      if (reqRef && reqSnap && reqSnap.exists()) {
        transaction.update(reqRef, {
          status:    'Completed',
          updatedAt: serverTimestamp(),
        });
      }

      // 8. Update parent book inventory counts
      transaction.update(bookRef, {
        totalCopies,
        availableCopies,
        borrowedCopies,
        reservedCopies,
        damagedCopies,
        lostCopies,
        archivedCopies,
        maintenanceCopies,
        status:    bookStatusResult,
        updatedAt: serverTimestamp(),
      });

    } else {
      // No bookId — only update the transaction and copy

      const returnHistoryEvent = {
        event:     `Book Returned & Inspected (Condition: ${returnCondition})`,
        timestamp: now.toISOString(),
        actor:     adminName,
        notes:     notes || '',
      };

      transaction.update(txnRef, {
        status:     TRANSACTION_STATUSES.RETURNED,
        returnDate: now.toISOString(),
        condition:  returnCondition,
        notes:      notes || txnData.notes || '',
        returnedBy: adminName,
        history:    [...(txnData.history || []), returnHistoryEvent],
        updatedAt:  serverTimestamp(),
      });

      if (copyRef && copySnap && copySnap.exists()) {
        transaction.update(copyRef, {
          status:               finalCopyStatus,
          condition:            returnCondition,
          currentTransactionId: null,
          currentBorrowerId:    null,
          notes:                notes || '',
          updatedAt:            serverTimestamp(),
        });
      }

      if (reqRef && reqSnap && reqSnap.exists()) {
        transaction.update(reqRef, {
          status:    'Completed',
          updatedAt: serverTimestamp(),
        });
      }
    }
  });

  // Post-transaction: log & notify (outside runTransaction — safe)
  await logActivityRecord({
    user:   adminName,
    action: `processed return (Condition: ${returnCondition}) for`,
    target: targetBookTitle || 'Book',
    type:   'return',
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
  Renew Active Loan Transaction.

  Read order (ALL reads before ANY write):
    1. Read transaction doc
    2. Query pending borrow requests queue (getDocs — outside transaction lock, acceptable)
  Write order:
    3. Update transaction doc (renewal)
 */
export const renewBookTransaction = async (transactionId, extensionDays = 14, adminName = 'Lead Librarian') => {
  const now    = new Date();
  const txnRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  let targetStudentId = null;
  let targetBookTitle = null;
  let newDueDate      = null;

  // Pre-check pending queue OUTSIDE the transaction so we don't mix getDocs with transaction.get
  let hasQueuedRequests = false;
  let queuedCount       = 0;
  let bookIdForQueue    = null;

  // Fetch transaction data first to get bookId
  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read transaction doc
    const txnSnap = await transaction.get(txnRef);
    if (!txnSnap.exists()) {
      throw new Error(`Transaction ${transactionId} not found.`);
    }
    const txnData = txnSnap.data();
    targetStudentId = txnData.studentId;
    targetBookTitle = txnData.bookTitle;
    bookIdForQueue  = txnData.bookId;

    if (txnData.status !== TRANSACTION_STATUSES.ISSUED) {
      throw new Error(`Only active loans (Issued) can be renewed.`);
    }

    const currentRenewals = Number(txnData.renewalCount || 0);
    if (currentRenewals >= MAX_RENEWAL_LIMIT) {
      throw new Error(`Maximum limit of ${MAX_RENEWAL_LIMIT} renewals reached for this loan.`);
    }

    // 2. Check pending reservation queue using getDocs (non-transactional read — safe because
    //    we are only reading borrowRequests, not writing it, and we only abort on violation).
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

    // ── PHASE 2: COMPUTE NEW DUE DATE ─────────────────────────────────────

    const currentDueDateObj = txnData.dueDate ? new Date(txnData.dueDate) : now;
    const baseDate = currentDueDateObj > now ? currentDueDateObj : now;
    newDueDate = addDays(baseDate, extensionDays).toISOString();

    const renewalHistoryEvent = {
      event:     `Loan Renewed (+${extensionDays} Days, Renewal #${currentRenewals + 1})`,
      timestamp: now.toISOString(),
      actor:     adminName,
    };

    // ── PHASE 3: WRITE ────────────────────────────────────────────────────

    // 3. Update transaction doc
    transaction.update(txnRef, {
      dueDate:      newDueDate,
      renewalCount: currentRenewals + 1,
      history:      [...(txnData.history || []), renewalHistoryEvent],
      updatedAt:    serverTimestamp(),
    });
  });

  // Post-transaction
  if (targetStudentId) {
    await sendStudentNotification(
      targetStudentId,
      'Loan Renewed Successfully! 🔄',
      `Your loan for "${targetBookTitle}" has been extended by ${extensionDays} days. New return deadline: ${new Date(newDueDate).toLocaleDateString()}.`,
      { transactionId, dueDate: newDueDate }
    );
  }

  await logActivityRecord({
    user:   adminName,
    action: `renewed loan (+${extensionDays} days) for`,
    target: targetBookTitle || transactionId,
    type:   'issue',
  });

  return { transactionId, newDueDate };
};

/**
  Fetch Return Reminders Categorization (Due Today, Due Tomorrow, Overdue)
 */
export const getReturnReminders = async () => {
  const now      = new Date();
  const tomorrow = addDays(now, 1);

  try {
    const q        = query(collection(db, TRANSACTIONS_COLLECTION), where('status', '==', TRANSACTION_STATUSES.ISSUED));
    const snapshot = await getDocs(q);

    const dueToday    = [];
    const dueTomorrow = [];
    const overdue     = [];

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
