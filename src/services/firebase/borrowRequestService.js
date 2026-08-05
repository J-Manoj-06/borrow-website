import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { REQUEST_STATUSES } from '../../models/borrowRequestModel';
import { COPY_STATUSES, BOOK_STATUSES } from '../../models/bookModel';
import { logActivityRecord } from './activityService';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';

const REQUESTS_COLLECTION = 'borrowRequests';
const NOTIFICATIONS_COLLECTION = 'notifications';
const STUDENTS_COLLECTION = 'students';
const TRANSACTIONS_COLLECTION = 'transactions';
const COPIES_COLLECTION = 'bookCopies';
const BOOKS_COLLECTION = 'books';

const MAX_BORROW_LIMIT = 3;
const RESERVATION_EXPIRATION_HOURS = 48;

/**
  Subscribe to Real-Time Borrow Requests Snapshot
 */
export const subscribeToBorrowRequests = (callback) => {
  const q = query(collection(db, REQUESTS_COLLECTION), orderBy('requestDate', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        requestDate: docSnap.data().requestDate?.toDate?.()?.toISOString() || docSnap.data().requestDate || new Date().toISOString(),
        dueDate: docSnap.data().dueDate?.toDate?.()?.toISOString() || docSnap.data().dueDate || null,
        approvedDate: docSnap.data().approvedDate?.toDate?.()?.toISOString() || docSnap.data().approvedDate || null,
        rejectedDate: docSnap.data().rejectedDate?.toDate?.()?.toISOString() || docSnap.data().rejectedDate || null,
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt || new Date().toISOString(),
      }));
      callback(requests);
    },
    (error) => {
      console.error('Firestore real-time borrow requests subscription error:', error);
      callback([]);
    }
  );
};

/**
  Send Automated Notification to Student App via Firestore
 */
export const sendStudentNotification = async (studentId, title, body, metadata = {}) => {
  const notificationPayload = {
    studentId,
    title,
    body,
    metadata,
    read: false,
    sentAt: new Date().toISOString(),
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationPayload);
  } catch (err) {
    console.error('Firestore notification write failed:', err);
  }
};

/**
  Validate Student Borrow Eligibility before accepting a request or checkout
 */
export const validateStudentBorrowEligibility = async (studentId, bookId) => {
  try {
    // 1. Verify student account status
    const studentQuery = query(collection(db, STUDENTS_COLLECTION), where('registerNumber', '==', studentId));
    const studentSnap = await getDocs(studentQuery);

    if (!studentSnap.empty) {
      const studentData = studentSnap.docs[0].data();
      if (studentData.status && studentData.status !== 'Active') {
        return {
          eligible: false,
          reason: `Student account is currently ${studentData.status}. Borrowing privileges suspended.`,
        };
      }
    }

    // 2. Count active transactions (Issued) & overdue loans
    const txnsQuery = query(collection(db, TRANSACTIONS_COLLECTION), where('studentId', '==', studentId));
    const txnsSnap = await getDocs(txnsQuery);
    const activeTxns = txnsSnap.docs.map((d) => d.data()).filter((t) => t.status === 'Issued');

    const now = new Date();
    const overdueCount = activeTxns.filter((t) => t.dueDate && new Date(t.dueDate) < now).length;

    if (overdueCount > 0) {
      return {
        eligible: false,
        reason: `Student has ${overdueCount} outstanding overdue book(s). Please return overdue books first.`,
      };
    }

    // 3. Count active borrow requests (Pending / Approved)
    const requestsQuery = query(collection(db, REQUESTS_COLLECTION), where('studentId', '==', studentId));
    const reqsSnap = await getDocs(requestsQuery);
    const activeReqs = reqsSnap.docs.map((d) => d.data()).filter((r) => r.status === REQUEST_STATUSES.PENDING || r.status === REQUEST_STATUSES.APPROVED);

    const totalActiveCount = activeTxns.length + activeReqs.length;
    if (totalActiveCount >= MAX_BORROW_LIMIT) {
      return {
        eligible: false,
        reason: `Student has reached maximum limit of ${MAX_BORROW_LIMIT} active loans/requests.`,
      };
    }

    // 4. Prevent duplicate request for exact same book title
    if (bookId) {
      const duplicateTxn = activeTxns.some((t) => t.bookId === bookId);
      const duplicateReq = activeReqs.some((r) => r.bookId === bookId);

      if (duplicateTxn || duplicateReq) {
        return {
          eligible: false,
          reason: 'Student already has an active request or checkout for this book title.',
        };
      }
    }

    return { eligible: true };
  } catch (err) {
    console.error('Eligibility validation error:', err);
    return { eligible: true };
  }
};

/**
  Create Borrow Request with Eligibility Check
 */
export const createBorrowRequest = async (requestData) => {
  // Pre-check student eligibility
  const eligibility = await validateStudentBorrowEligibility(requestData.studentId, requestData.bookId);
  if (!eligibility.eligible) {
    throw new Error(eligibility.reason);
  }

  const now = new Date();
  const requestId = `REQ-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const payload = {
    requestId,
    bookId: requestData.bookId,
    bookTitle: requestData.bookTitle,
    bookAuthor: requestData.bookAuthor || '',
    bookCoverUrl: requestData.bookCoverUrl || '',
    isbn: requestData.isbn || '',
    studentId: requestData.studentId,
    studentName: requestData.studentName,
    registerNumber: requestData.registerNumber || requestData.studentId,
    department: requestData.department || 'Computer Science',
    year: requestData.year || '3rd Year',
    requestDate: now.toISOString(),
    status: REQUEST_STATUSES.PENDING,
    history: [
      {
        event: 'Borrow Request Submitted',
        timestamp: now.toISOString(),
        actor: requestData.studentName,
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, REQUESTS_COLLECTION), payload);

  await logActivityRecord({
    user: requestData.studentName,
    action: 'submitted borrow request for',
    target: requestData.bookTitle,
    type: 'request',
  });

  return { id: docRef.id, ...payload };
};

/**
  Approve Borrow Request with Physical Copy Reservation inside an Atomic Firestore Transaction.

  Read order (ALL reads before ANY write):
    1. Read request doc
    2. Query all copies for this book (getDocs — finds the available copy to reserve)
    3. Read parent book doc (for isArchived flag used in count computation)
  Write order:
    4. Update reserved copy status
    5. Update borrow request
    6. Update parent book inventory counts
 */
export const approveBorrowRequestTransaction = async (requestId, durationDays = 14, adminName = 'Lead Librarian') => {
  const now = new Date();
  const reservationExpiresAt = addHours(now, RESERVATION_EXPIRATION_HOURS).toISOString();
  const computedDueDate = addDays(now, durationDays).toISOString();

  let targetStudentId = null;
  let targetBookTitle = null;
  let reservedCopyId  = null;

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ──────────────────────────────────────────────

    // 1. Read request doc
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const reqSnap    = await transaction.get(requestRef);

    if (!reqSnap.exists()) {
      throw new Error(`Borrow Request ${requestId} not found.`);
    }

    const reqData = reqSnap.data();
    targetStudentId = reqData.studentId;
    targetBookTitle = reqData.bookTitle;

    if (reqData.status !== REQUEST_STATUSES.PENDING) {
      throw new Error(`Request ${requestId} is no longer Pending.`);
    }

    // 2. Query ALL copies for this book (read all so we can compute counts without a post-write read)
    const allCopiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', reqData.bookId));
    const allCopiesSnap  = await getDocs(allCopiesQuery);

    // Pick the first available copy
    const availableCopyDoc = allCopiesSnap.docs.find((d) => d.data().status === COPY_STATUSES.AVAILABLE);
    if (!availableCopyDoc) {
      throw new Error(`No available physical copy on shelf for "${reqData.bookTitle}".`);
    }
    reservedCopyId  = availableCopyDoc.id;
    const copyRef   = availableCopyDoc.ref;

    // 3. Read parent book doc for isArchived flag
    const bookRef  = doc(db, BOOKS_COLLECTION, reqData.bookId);
    const bookSnap = await transaction.get(bookRef);

    // ── PHASE 2: COMPUTE INVENTORY COUNTS ──────────────────────────────

    let availableCopies   = 0;
    let borrowedCopies    = 0;
    let reservedCopies    = 0;
    let damagedCopies     = 0;
    let lostCopies        = 0;
    let archivedCopies    = 0;
    let maintenanceCopies = 0;
    let totalCopies       = 0;

    allCopiesSnap.docs.forEach((d) => {
      const c = d.data();
      // Apply the pending write: the chosen copy will become RESERVED
      const effectiveStatus = (d.id === reservedCopyId) ? COPY_STATUSES.RESERVED : c.status;

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

    const isArchived = bookSnap.exists() ? Boolean(bookSnap.data().isArchived) : false;
    let bookStatus = BOOK_STATUSES.AVAILABLE;
    if (isArchived) {
      bookStatus = BOOK_STATUSES.ARCHIVED;
    } else if (availableCopies > 0) {
      bookStatus = BOOK_STATUSES.AVAILABLE;
    } else if (borrowedCopies > 0 || reservedCopies > 0) {
      bookStatus = BOOK_STATUSES.OUT_OF_STOCK;
    } else {
      bookStatus = BOOK_STATUSES.UNAVAILABLE;
    }

    // ── PHASE 3: ALL WRITES ─────────────────────────────────────────────

    // 4. Reserve physical copy
    transaction.update(copyRef, {
      status:            COPY_STATUSES.RESERVED,
      currentBorrowerId: reqData.studentId,
      updatedAt:         serverTimestamp(),
    });

    // 5. Update borrow request record
    const approvalHistoryEvent = {
      event:     `Request Approved & Physical Copy ${reservedCopyId} Reserved (Expires in ${RESERVATION_EXPIRATION_HOURS}h)`,
      timestamp: now.toISOString(),
      actor:     adminName,
    };

    transaction.update(requestRef, {
      status:               REQUEST_STATUSES.APPROVED,
      approvedDate:         now.toISOString(),
      reservedCopyId,
      reservedAt:           now.toISOString(),
      reservationExpiresAt,
      dueDate:              computedDueDate,
      approvedBy:           adminName,
      history:              [...(reqData.history || []), approvalHistoryEvent],
      updatedAt:            serverTimestamp(),
    });

    // 6. Update parent book inventory counts (no new reads needed)
    if (bookSnap.exists()) {
      transaction.update(bookRef, {
        totalCopies,
        availableCopies,
        borrowedCopies,
        reservedCopies,
        damagedCopies,
        lostCopies,
        archivedCopies,
        maintenanceCopies,
        status:    bookStatus,
        updatedAt: serverTimestamp(),
      });
    }
  });

  // Notify student & record activity
  if (targetStudentId) {
    await sendStudentNotification(
      targetStudentId,
      'Borrow Request Approved! 🎉',
      `Your request for "${targetBookTitle}" was approved. Copy ${reservedCopyId} has been reserved. Please collect it before ${new Date(reservationExpiresAt).toLocaleString()}.`,
      { requestId, reservedCopyId, reservationExpiresAt }
    );
  }

  await logActivityRecord({
    user: adminName,
    action: `approved request & reserved copy ${reservedCopyId} for`,
    target: targetBookTitle || requestId,
    type: 'request',
  });

  return { requestId, reservedCopyId, reservationExpiresAt };
};

/**
  Reject Borrow Request with Reason Logging inside Atomic Transaction
 */
export const rejectBorrowRequestTransaction = async (requestId, reason, adminName = 'Lead Librarian') => {
  const now = new Date();
  let targetStudentId = null;
  let targetBookTitle = null;

  await runTransaction(db, async (transaction) => {
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const reqSnap = await transaction.get(requestRef);

    if (!reqSnap.exists()) {
      throw new Error(`Borrow Request ${requestId} not found.`);
    }

    const reqData = reqSnap.data();
    targetStudentId = reqData.studentId;
    targetBookTitle = reqData.bookTitle;

    const rejectionHistoryEvent = {
      event: `Request Rejected (${reason})`,
      timestamp: now.toISOString(),
      actor: adminName,
    };

    transaction.update(requestRef, {
      status: REQUEST_STATUSES.REJECTED,
      rejectedDate: now.toISOString(),
      rejectionReason: reason,
      approvedBy: adminName,
      history: [...(reqData.history || []), rejectionHistoryEvent],
      updatedAt: serverTimestamp(),
    });
  });

  if (targetStudentId) {
    await sendStudentNotification(
      targetStudentId,
      'Borrow Request Declined ❌',
      `Your request for "${targetBookTitle}" was declined. Reason: ${reason}.`,
      { requestId, reason }
    );
  }

  await logActivityRecord({
    user: adminName,
    action: `rejected request (${reason}) for`,
    target: targetBookTitle || requestId,
    type: 'request',
  });

  return true;
};

/**
  Check for Expired Reservations and Restore Physical Copies to Available.

  Read order (ALL reads before ANY write) per reservation:
    1. Read copy doc (to verify it is still Reserved)
    2. Read all book copies + book doc for inventory count computation
  Write order:
    3. Update request status to Expired
    4. Update copy status back to Available
    5. Update parent book inventory counts
 */
export const checkAndExpireReservations = async () => {
  const now = new Date();

  try {
    const q        = query(collection(db, REQUESTS_COLLECTION), where('status', '==', REQUEST_STATUSES.APPROVED));
    const snapshot = await getDocs(q);

    for (const docSnap of snapshot.docs) {
      const req = docSnap.data();
      if (req.reservationExpiresAt && new Date(req.reservationExpiresAt) < now) {

        await runTransaction(db, async (transaction) => {
          const reqRef = docSnap.ref;

          // ── PHASE 1: ALL READS ────────────────────────────────────────

          // 1. Read copy doc
          let copyRef  = null;
          let copySnap = null;
          if (req.reservedCopyId) {
            copyRef  = doc(db, COPIES_COLLECTION, req.reservedCopyId);
            copySnap = await transaction.get(copyRef);
          }

          // 2. Read all copies + book doc for inventory count
          let allCopiesSnap = null;
          let bookRef       = null;
          let bookSnap      = null;
          if (req.bookId) {
            const allCopiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', req.bookId));
            allCopiesSnap = await getDocs(allCopiesQuery);
            bookRef  = doc(db, BOOKS_COLLECTION, req.bookId);
            bookSnap = await transaction.get(bookRef);
          }

          // ── PHASE 2: COMPUTE COUNTS ────────────────────────────────────

          const willRestoreCopy =
            copySnap && copySnap.exists() && copySnap.data().status === COPY_STATUSES.RESERVED;

          let availableCopies   = 0;
          let borrowedCopies    = 0;
          let reservedCopies    = 0;
          let damagedCopies     = 0;
          let lostCopies        = 0;
          let archivedCopies    = 0;
          let maintenanceCopies = 0;
          let totalCopies       = 0;
          let bookStatus        = BOOK_STATUSES.AVAILABLE;

          if (allCopiesSnap) {
            allCopiesSnap.docs.forEach((d) => {
              const c = d.data();
              // Apply pending write: restored copy will become AVAILABLE
              const effectiveStatus =
                (willRestoreCopy && copyRef && d.id === copyRef.id)
                  ? COPY_STATUSES.AVAILABLE
                  : c.status;

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

            const isArchived = bookSnap && bookSnap.exists() ? Boolean(bookSnap.data().isArchived) : false;
            if (isArchived) {
              bookStatus = BOOK_STATUSES.ARCHIVED;
            } else if (availableCopies > 0) {
              bookStatus = BOOK_STATUSES.AVAILABLE;
            } else if (borrowedCopies > 0 || reservedCopies > 0) {
              bookStatus = BOOK_STATUSES.OUT_OF_STOCK;
            } else {
              bookStatus = BOOK_STATUSES.UNAVAILABLE;
            }
          }

          // ── PHASE 3: ALL WRITES ────────────────────────────────────────

          // 3. Expire the request
          transaction.update(reqRef, {
            status:    REQUEST_STATUSES.EXPIRED,
            updatedAt: serverTimestamp(),
          });

          // 4. Restore copy to Available
          if (willRestoreCopy && copyRef) {
            transaction.update(copyRef, {
              status:            COPY_STATUSES.AVAILABLE,
              currentBorrowerId: null,
              updatedAt:         serverTimestamp(),
            });
          }

          // 5. Update parent book inventory counts
          if (bookRef && bookSnap && bookSnap.exists()) {
            transaction.update(bookRef, {
              totalCopies,
              availableCopies,
              borrowedCopies,
              reservedCopies,
              damagedCopies,
              lostCopies,
              archivedCopies,
              maintenanceCopies,
              status:    bookStatus,
              updatedAt: serverTimestamp(),
            });
          }
        });

        await logActivityRecord({
          user:   'System Cron',
          action: `expired reservation for request ${req.requestId}`,
          target: req.bookTitle || req.requestId,
          type:   'request',
        });
      }
    }
  } catch (err) {
    console.error('Check reservation expiration failed:', err);
  }
};
