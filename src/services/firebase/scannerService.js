/**
 * Production Scanner Firestore Service
 *
 * Provides Firestore lookups for QR / Barcode scan results:
 *  - lookupBookCopy    : search bookCopies by copyId, qrCode, or barcode (ISBN)
 *  - lookupStudent     : search students by registerNumber or id
 *  - lookupTransaction : search transactions by id or transactionId field
 *  - markCopyDamaged   : update copy status + sync parent book counts + log + notify
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { logActivityRecord } from './activityService';
import { sendStudentNotification } from './borrowRequestService';
import { applySyncBookCopyCounts } from './bookService';
import { COPY_STATUSES } from '../../models/bookModel';

const COPIES_COLLECTION = 'bookCopies';
const BOOKS_COLLECTION = 'books';
const STUDENTS_COLLECTION = 'students';
const TRANSACTIONS_COLLECTION = 'transactions';

// ─────────────────────────────────────────────
// BOOK COPY LOOKUP
// ─────────────────────────────────────────────

/**
 * Search bookCopies collection by copyId, qrCode, or barcode/ISBN.
 * Returns { copy, book } or null if not found.
 */
export const lookupBookCopy = async (scanCode) => {
  const code = (scanCode || '').trim();
  if (!code) return null;

  let copyData = null;

  // Try exact copyId match
  const copyRef = doc(db, COPIES_COLLECTION, code);
  const copySnap = await getDoc(copyRef);
  if (copySnap.exists()) {
    copyData = { id: copySnap.id, ...copySnap.data() };
  }

  // Try qrCode field match
  if (!copyData) {
    const qrQuery = query(collection(db, COPIES_COLLECTION), where('qrCode', '==', code));
    const qrSnap = await getDocs(qrQuery);
    if (!qrSnap.empty) {
      const d = qrSnap.docs[0];
      copyData = { id: d.id, ...d.data() };
    }
  }

  // Try copyId field match (in case doc ID differs from copyId field)
  if (!copyData) {
    const copyIdQuery = query(collection(db, COPIES_COLLECTION), where('copyId', '==', code));
    const copyIdSnap = await getDocs(copyIdQuery);
    if (!copyIdSnap.empty) {
      const d = copyIdSnap.docs[0];
      copyData = { id: d.id, ...d.data() };
    }
  }

  // Try barcode / ISBN field match
  if (!copyData) {
    const barcodeQuery = query(collection(db, COPIES_COLLECTION), where('barcode', '==', code));
    const barcodeSnap = await getDocs(barcodeQuery);
    if (!barcodeSnap.empty) {
      const d = barcodeSnap.docs[0];
      copyData = { id: d.id, ...d.data() };
    }
  }

  // Try books collection by ISBN as a fallback
  if (!copyData) {
    const isbnQuery = query(collection(db, BOOKS_COLLECTION), where('isbn', '==', code));
    const isbnSnap = await getDocs(isbnQuery);
    if (!isbnSnap.empty) {
      const bookDoc = isbnSnap.docs[0];
      const bookData = { id: bookDoc.id, ...bookDoc.data() };
      // Return book-level result (no specific copy)
      return { copy: null, book: bookData };
    }
  }

  if (!copyData) return null;

  // Fetch parent book
  let bookData = null;
  if (copyData.bookId) {
    const bookSnap = await getDoc(doc(db, BOOKS_COLLECTION, copyData.bookId));
    if (bookSnap.exists()) {
      bookData = { id: bookSnap.id, ...bookSnap.data() };
    }
  }

  // Find active transaction for this copy
  let activeTxn = null;
  if (copyData.currentTransactionId) {
    const txnSnap = await getDoc(doc(db, TRANSACTIONS_COLLECTION, copyData.currentTransactionId));
    if (txnSnap.exists()) {
      const txnData = txnSnap.data();
      activeTxn = {
        id: txnSnap.id,
        ...txnData,
        issueDate: txnData.issueDate?.toDate?.()?.toISOString() || txnData.issueDate || null,
        dueDate: txnData.dueDate?.toDate?.()?.toISOString() || txnData.dueDate || null,
      };
    }
  }

  return { copy: copyData, book: bookData, activeTxn };
};

// ─────────────────────────────────────────────
// STUDENT LOOKUP
// ─────────────────────────────────────────────

/**
 * Search students by Firestore document ID or registerNumber field.
 * Also returns active loans from the transactions collection.
 */
export const lookupStudent = async (scanCode) => {
  const code = (scanCode || '').trim();
  if (!code) return null;

  let studentData = null;

  // Try exact Firestore document ID
  const studentRef = doc(db, STUDENTS_COLLECTION, code);
  const studentSnap = await getDoc(studentRef);
  if (studentSnap.exists()) {
    studentData = { id: studentSnap.id, ...studentSnap.data() };
  }

  // Try registerNumber field match
  if (!studentData) {
    const regQuery = query(collection(db, STUDENTS_COLLECTION), where('registerNumber', '==', code));
    const regSnap = await getDocs(regQuery);
    if (!regSnap.empty) {
      const d = regSnap.docs[0];
      studentData = { id: d.id, ...d.data() };
    }
  }

  if (!studentData) return null;

  // Fetch active loans for this student
  const loansQuery = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('studentId', '==', studentData.id),
    where('status', '==', 'Issued')
  );
  const loansSnap = await getDocs(loansQuery);
  const activeLoans = loansSnap.docs.map((d) => {
    const txn = d.data();
    return {
      id: d.id,
      bookTitle: txn.bookTitle,
      bookCopyId: txn.bookCopyId,
      issueDate: txn.issueDate?.toDate?.()?.toISOString() || txn.issueDate || null,
      dueDate: txn.dueDate?.toDate?.()?.toISOString() || txn.dueDate || null,
      status: txn.status,
    };
  });

  return { student: studentData, activeLoans };
};

// ─────────────────────────────────────────────
// TRANSACTION LOOKUP
// ─────────────────────────────────────────────

/**
 * Search transactions collection by Firestore doc ID or transactionId field.
 */
export const lookupTransaction = async (scanCode) => {
  const code = (scanCode || '').trim();
  if (!code) return null;

  let txnData = null;

  // Try exact Firestore document ID
  const txnRef = doc(db, TRANSACTIONS_COLLECTION, code);
  const txnSnap = await getDoc(txnRef);
  if (txnSnap.exists()) {
    txnData = { id: txnSnap.id, ...txnSnap.data() };
  }

  // Try transactionId field match (human-readable TXN-XXXX-XXXXXX)
  if (!txnData) {
    const txnIdQuery = query(collection(db, TRANSACTIONS_COLLECTION), where('transactionId', '==', code));
    const txnIdSnap = await getDocs(txnIdQuery);
    if (!txnIdSnap.empty) {
      const d = txnIdSnap.docs[0];
      txnData = { id: d.id, ...d.data() };
    }
  }

  if (!txnData) return null;

  const formatDate = (v) => v?.toDate?.()?.toISOString() || v || null;

  return {
    id: txnData.id,
    ...txnData,
    issueDate: formatDate(txnData.issueDate),
    dueDate: formatDate(txnData.dueDate),
    returnDate: formatDate(txnData.returnDate),
    createdAt: formatDate(txnData.createdAt),
  };
};

// ─────────────────────────────────────────────
// MARK COPY DAMAGED
// ─────────────────────────────────────────────

/**
 * Atomically marks a physical copy as Damaged, syncs parent book counts,
 * logs the activity, and sends a notification to the borrower (if any).
 *
 * Read order (ALL reads before ANY write):
 *   1. Read copy doc
 *   2. Read book doc (if bookId present on copy)
 *   3. Read all copies for this book (for inventory count)
 * Write order:
 *   4. Update copy status to Damaged
 *   5. Update parent book inventory counts
 */
export const markCopyDamaged = async (copyId, notes = '', adminName = 'Lead Librarian') => {
  const copyRef = doc(db, COPIES_COLLECTION, copyId);

  let studentId = null;
  let bookTitle = null;

  // Pre-fetch all copies for inventory sync OUTSIDE the transaction
  // (we need the bookId from the copy first — do a cheap getDoc)
  const preReadCopy = await getDoc(copyRef);
  let allCopiesSnap = null;
  if (preReadCopy.exists() && preReadCopy.data().bookId) {
    const bookId = preReadCopy.data().bookId;
    const q = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    allCopiesSnap = await getDocs(q);
  }

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read copy doc
    const copySnap = await transaction.get(copyRef);
    if (!copySnap.exists()) {
      throw new Error(`Physical Copy ${copyId} not found in Firestore.`);
    }
    const copyData = copySnap.data();
    studentId = copyData.currentBorrowerId || null;

    // 2. Read book doc
    let bookRef  = null;
    let bookSnap = null;
    if (copyData.bookId) {
      bookRef  = doc(db, BOOKS_COLLECTION, copyData.bookId);
      bookSnap = await transaction.get(bookRef);
      if (bookSnap.exists()) bookTitle = bookSnap.data().title;
    }

    // ── PHASE 2: COMPUTE COUNTS ───────────────────────────────────────────

    // ── PHASE 3: ALL WRITES ───────────────────────────────────────────────

    // 3. Update copy status
    transaction.update(copyRef, {
      status:    COPY_STATUSES.DAMAGED,
      condition: 'Damaged',
      notes:     notes || 'Marked Damaged via Scanner',
      updatedAt: serverTimestamp(),
    });

    // 4. Sync parent book inventory counts using pre-read copy snapshots
    if (bookRef && bookSnap && allCopiesSnap) {
      const pendingChanges = { [copyRef.id]: COPY_STATUSES.DAMAGED };
      applySyncBookCopyCounts(
        transaction,
        bookRef,
        bookSnap,
        allCopiesSnap.docs,
        pendingChanges
      );
    }
  });

  await logActivityRecord({
    user:   adminName,
    action: `marked copy ${copyId} as Damaged`,
    target: bookTitle || copyId,
    type:   'edit',
    notes,
  });

  if (studentId) {
    await sendStudentNotification(
      studentId,
      'Book Condition Update 📋',
      `Copy ${copyId} of "${bookTitle || 'a borrowed book'}" has been marked as Damaged. Please contact the library.`,
      { copyId, status: 'Damaged' }
    );
  }

  return true;
};
