import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebaseConfig';
import { generateCopiesForBook, BOOK_STATUSES, COPY_STATUSES, COPY_CONDITIONS } from '../../models/bookModel';
import { logActivityRecord } from './activityService';

const BOOKS_COLLECTION = 'books';
const COPIES_COLLECTION = 'bookCopies';

/**
  Compress Image File using Canvas before upload
 */
export const compressImage = (file, maxWidth = 800, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
    };
  });
};

/**
  Upload Book Cover Image to Firebase Storage or Base64 fallback
 */
export const uploadBookCover = async (file, isbn) => {
  if (!file) return null;

  const compressedFile = await compressImage(file);

  try {
    const cleanIsbn = isbn ? isbn.replace(/[^0-9X]/gi, '') : Date.now();
    const storageRef = ref(storage, `book-covers/cover_${cleanIsbn}_${Date.now()}.webp`);
    const snapshot = await uploadBytes(storageRef, compressedFile);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase storage upload failed, using Data URL fallback:', err);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(compressedFile);
    });
  }
};

/**
  Helper: compute book-level inventory counts from a pre-fetched copies snapshot,
  then write the updated counts back to the parent book document.

  IMPORTANT: All transaction.get() calls for the copies AND for the book must be
  completed by the caller BEFORE calling this helper.  This function only performs
  writes, which keeps callers compliant with Firestore's reads-before-writes rule.

  Parameters:
    transaction    – the active Firestore Transaction object
    bookRef        – DocumentReference for the parent book
    bookSnap       – the already-read DocumentSnapshot for the book
    copiesSnapDocs – array of DocumentSnapshot objects for every copy of this book
    pendingChanges – Map<copyDocId, newStatus> for writes that are about to happen
                     so the count reflects the post-write state
 */
export const applySyncBookCopyCounts = (transaction, bookRef, bookSnap, copiesSnapDocs, pendingChanges = {}) => {
  if (!bookSnap || !bookSnap.exists()) return;

  let availableCopies   = 0;
  let borrowedCopies    = 0;
  let reservedCopies    = 0;
  let damagedCopies     = 0;
  let lostCopies        = 0;
  let archivedCopies    = 0;
  let maintenanceCopies = 0;
  let totalCopies       = 0;

  copiesSnapDocs.forEach((docSnap) => {
    const c = docSnap.data();
    // Apply any pending status overrides
    const effectiveStatus = (docSnap.id in pendingChanges) ? pendingChanges[docSnap.id] : c.status;

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

  const bookData   = bookSnap.data();
  const isArchived = Boolean(bookData.isArchived);

  let status = BOOK_STATUSES.AVAILABLE;
  if (isArchived) {
    status = BOOK_STATUSES.ARCHIVED;
  } else if (availableCopies > 0) {
    status = BOOK_STATUSES.AVAILABLE;
  } else if (borrowedCopies > 0 || reservedCopies > 0) {
    status = BOOK_STATUSES.OUT_OF_STOCK;
  } else {
    status = BOOK_STATUSES.UNAVAILABLE;
  }

  transaction.update(bookRef, {
    totalCopies,
    availableCopies,
    borrowedCopies,
    reservedCopies,
    damagedCopies,
    lostCopies,
    archivedCopies,
    maintenanceCopies,
    status,
    updatedAt: serverTimestamp(),
  });
};

/**
  Legacy async helper kept for any external call sites.
  Uses getDocs (non-transactional) then calls applySyncBookCopyCounts.
  DO NOT call this inside a runTransaction — use applySyncBookCopyCounts instead.
 */
export const syncBookCopyCounts = async (transaction, bookId) => {
  const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  const querySnap   = await getDocs(copiesQuery);
  const bookRef     = doc(db, BOOKS_COLLECTION, bookId);
  const bookSnap    = await transaction.get(bookRef);
  applySyncBookCopyCounts(transaction, bookRef, bookSnap, querySnap.docs, {});
};

/**
  Subscribe to Real-Time Books Snapshot
 */
export const subscribeToBooks = (callback) => {
  const q = query(collection(db, BOOKS_COLLECTION), orderBy('updatedAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const books = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt || new Date().toISOString(),
      }));
      callback(books);
    },
    (error) => {
      console.error('Firestore real-time books subscription error:', error);
      callback([]);
    }
  );
};

/**
  Subscribe to Real-Time Book Copies Snapshot for a specific Book ID
 */
export const subscribeToBookCopies = (bookId, callback) => {
  if (!bookId) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  return onSnapshot(
    q,
    (snapshot) => {
      const copies = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || docSnap.data().createdAt || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || docSnap.data().updatedAt || new Date().toISOString(),
      }));
      callback(copies);
    },
    (error) => {
      console.error('Firestore bookCopies snapshot error:', error);
      callback([]);
    }
  );
};

/**
  Check if an ISBN already exists in the catalog (excluding currentBookId)
 */
export const checkIsbnExists = async (isbn, currentBookId = null) => {
  const targetIsbn = isbn ? isbn.trim().replace(/[^0-9X]/gi, '') : '';
  if (!targetIsbn) return false;

  try {
    const q = query(collection(db, BOOKS_COLLECTION), where('isbn', '==', targetIsbn));
    const querySnapshot = await getDocs(q);
    const matches = querySnapshot.docs.filter((d) => d.id !== currentBookId);
    return matches.length > 0;
  } catch (err) {
    console.error('Firestore checkIsbnExists failed:', err);
    return false;
  }
};

/**
  Fetch All Books from Firestore
 */
export const getAllBooks = async () => {
  try {
    const q = query(collection(db, BOOKS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (err) {
    console.error('Firestore getAllBooks failed:', err);
    return [];
  }
};

/**
  Fetch Book Copies for a specific Book ID
 */
export const getBookCopies = async (bookId) => {
  try {
    const q = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (err) {
    console.error('Firestore getBookCopies failed:', err);
    return [];
  }
};

/**
  Add New Book & Generate Physical Copy Documents in an Atomic Firestore Transaction
 */
export const createBook = async (bookData, coverFile) => {
  let coverUrl = bookData.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';

  if (coverFile) {
    const uploadedUrl = await uploadBookCover(coverFile, bookData.isbn);
    if (uploadedUrl) coverUrl = uploadedUrl;
  }

  const requestedCopiesCount = Math.max(1, parseInt(bookData.totalCopies || 1, 10));

  const bookDocRef = doc(collection(db, BOOKS_COLLECTION));
  const newBookId = bookDocRef.id;

  const newBookPayload = {
    bookId: newBookId,
    title: bookData.title,
    subtitle: bookData.subtitle || '',
    author: bookData.author,
    publisher: bookData.publisher || '',
    isbn: bookData.isbn ? bookData.isbn.replace(/[^0-9X]/gi, '') : '',
    category: bookData.category || 'General',
    language: bookData.language || 'English',
    edition: bookData.edition || '1st Edition',
    publicationYear: Number(bookData.publicationYear || new Date().getFullYear()),
    description: bookData.description || '',
    coverUrl,
    keywords: Array.isArray(bookData.keywords) ? bookData.keywords : (bookData.keywords || '').split(',').map((k) => k.trim()).filter(Boolean),
    department: bookData.department || 'Computer Science & Engineering',
    shelfNumber: bookData.shelfNumber || 'CS-01',
    rackNumber: bookData.rackNumber || 'R-01',
    status: BOOK_STATUSES.AVAILABLE,
    totalCopies: requestedCopiesCount,
    availableCopies: requestedCopiesCount,
    borrowedCopies: 0,
    reservedCopies: 0,
    damagedCopies: 0,
    lostCopies: 0,
    archivedCopies: 0,
    maintenanceCopies: 0,
    isArchived: false,
    recommendedReading: Boolean(bookData.recommendedReading),
  };

  // Generate physical copy documents
  const copies = generateCopiesForBook(
    newBookId,
    bookData.isbn,
    requestedCopiesCount,
    1,
    bookData.shelfNumber || 'CS-01',
    bookData.rackNumber || 'R-01'
  );

  // Execute Atomic Transaction
  await runTransaction(db, async (transaction) => {
    transaction.set(bookDocRef, {
      ...newBookPayload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    for (const copy of copies) {
      const copyRef = doc(db, COPIES_COLLECTION, copy.copyId);
      transaction.set(copyRef, {
        ...copy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `created title "${bookData.title}" and generated ${requestedCopiesCount} physical copies`,
    target: bookData.title,
    type: 'add',
  });

  return { id: newBookId, ...newBookPayload, copies };
};

/**
  Update Book Details and Copy Counts using Atomic Firestore Transaction.

  Read order (ALL reads before ANY write):
    1. Read book doc (via transaction.get)
    2. Query existing copies if totalCopies changed (getDocs — outside lock, then
       individual transaction.get per copy-to-delete for concurrency safety)
    3. Read book doc again via applySyncBookCopyCounts uses already-read bookSnap
  Write order:
    4. Set / delete copy documents
    5. Update book metadata
    6. Apply inventory count sync (pure write — no reads)
 */
export const updateBook = async (bookId, updateFields, coverFile) => {
  let coverUrl = updateFields.coverUrl;

  if (coverFile) {
    const uploadedUrl = await uploadBookCover(coverFile, updateFields.isbn);
    if (uploadedUrl) coverUrl = uploadedUrl;
  }

  const newTotalCopies = updateFields.totalCopies ? parseInt(updateFields.totalCopies, 10) : null;

  // Pre-fetch copies OUTSIDE the transaction so we don't need getDocs inside
  let existingCopiesDocs = [];
  if (newTotalCopies !== null) {
    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    const querySnap   = await getDocs(copiesQuery);
    existingCopiesDocs = querySnap.docs;
  }

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read book doc
    const bookRef  = doc(db, BOOKS_COLLECTION, bookId);
    const bookSnap = await transaction.get(bookRef);

    if (!bookSnap.exists()) {
      throw new Error(`Book ${bookId} does not exist in Firestore.`);
    }

    const currentBookData = bookSnap.data();
    const currentTotal    = Number(currentBookData.totalCopies || 0);

    // 2. For copies-to-delete: do individual transaction.get to lock them before writing
    const existingCopies = existingCopiesDocs.map((d) => ({ id: d.id, ref: d.ref, ...d.data() }));
    let copiesToDelete   = [];
    let newCopies        = [];

    if (newTotalCopies !== null && newTotalCopies !== currentTotal) {
      if (newTotalCopies > currentTotal) {
        // Increase: generate new copy documents — no read needed
        const maxNum    = existingCopies.reduce((max, c) => Math.max(max, Number(c.copyNumber || 0)), 0);
        const addedCount = newTotalCopies - currentTotal;
        newCopies = generateCopiesForBook(
          bookId,
          updateFields.isbn || currentBookData.isbn,
          addedCount,
          maxNum + 1,
          updateFields.shelfNumber || currentBookData.shelfNumber || 'CS-01',
          updateFields.rackNumber  || currentBookData.rackNumber  || 'R-01'
        );
      } else {
        // Decrease: select only Available copies to remove
        const diff          = currentTotal - newTotalCopies;
        const availableCops = existingCopies.filter((c) => c.status === COPY_STATUSES.AVAILABLE);

        if (availableCops.length < diff) {
          throw new Error(
            `Cannot reduce copy count by ${diff}. Only ${availableCops.length} copies are currently Available on shelf. Borrowed or Damaged copies cannot be deleted.`
          );
        }

        copiesToDelete = availableCops.slice(0, diff);

        // Read each copy-to-delete inside the transaction to lock it
        for (const copy of copiesToDelete) {
          const copyRef  = doc(db, COPIES_COLLECTION, copy.id || copy.copyId);
          const copySnap = await transaction.get(copyRef);
          // Re-validate inside the transaction (another request may have borrowed it)
          if (copySnap.exists() && copySnap.data().status !== COPY_STATUSES.AVAILABLE) {
            throw new Error(`Copy ${copy.id} is no longer Available and cannot be deleted.`);
          }
        }
      }
    }

    // ── PHASE 2: COMPUTE COUNTS for applySyncBookCopyCounts ──────────────
    // Build a pending-changes map reflecting all writes we are about to make
    const pendingChanges = {};
    copiesToDelete.forEach((c) => { pendingChanges[c.id || c.copyId] = '__DELETE__'; });
    newCopies.forEach((c)      => { pendingChanges[c.copyId]          = COPY_STATUSES.AVAILABLE; });

    // ── PHASE 3: ALL WRITES ───────────────────────────────────────────────

    const updatedMetadata = {
      ...updateFields,
      ...(coverUrl ? { coverUrl } : {}),
      updatedAt: serverTimestamp(),
    };

    // Set new copy documents
    for (const copy of newCopies) {
      const copyRef = doc(db, COPIES_COLLECTION, copy.copyId);
      transaction.set(copyRef, {
        ...copy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    // Delete removed copy documents
    for (const copy of copiesToDelete) {
      const copyRef = doc(db, COPIES_COLLECTION, copy.id || copy.copyId);
      transaction.delete(copyRef);
    }

    // Update book metadata
    transaction.update(bookRef, updatedMetadata);

    // Sync inventory counts using pre-read snapshots (no transaction.get called here)
    // Build effective copies list: existing (minus deleted) plus new
    const effectiveCopiesDocs = [
      ...existingCopiesDocs.filter((d) => !copiesToDelete.some((c) => (c.id || c.copyId) === d.id)),
      // new copies don't have snapshots yet; handled via pendingChanges
    ];
    applySyncBookCopyCounts(transaction, bookRef, bookSnap, effectiveCopiesDocs, pendingChanges);
  });

  await logActivityRecord({
    user:   'Librarian',
    action: `updated catalog details for book "${updateFields.title || bookId}"`,
    target: bookId,
    type:   'edit',
  });

  return { id: bookId, ...updateFields };
};

/**
  Update Status or Location of an Individual Physical Book Copy in an Atomic Transaction.

  Read order (ALL reads before ANY write):
    1. Read copy doc
    2. Read all copies for this book (for inventory count sync)
    3. Read book doc
  Write order:
    4. Update copy
    5. Sync parent book inventory counts (pure write)
 */
export const updateBookCopyStatus = async (
  copyId,
  newStatus,
  newCondition = 'Good',
  shelfLocation = null,
  rackNumber = null,
  notes = ''
) => {
  const copyRef = doc(db, COPIES_COLLECTION, copyId);

  let parentBookId = null;

  // Pre-fetch copy to get bookId, then fetch all copies for inventory sync
  const preReadCopy = await getDoc(copyRef);
  let allCopiesSnap = null;
  if (preReadCopy.exists() && preReadCopy.data().bookId) {
    parentBookId = preReadCopy.data().bookId;
    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', parentBookId));
    allCopiesSnap = await getDocs(copiesQuery);
  }

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read copy doc
    const copySnap = await transaction.get(copyRef);
    if (!copySnap.exists()) {
      throw new Error(`Physical Copy ${copyId} not found in Firestore.`);
    }
    const copyData = copySnap.data();
    parentBookId = copyData.bookId;

    if (copyData.status === COPY_STATUSES.BORROWED && newStatus !== COPY_STATUSES.BORROWED && newStatus !== COPY_STATUSES.RETURNED) {
      throw new Error(`Physical Copy ${copyId} is currently Borrowed by a student. Mark book returned first.`);
    }

    // 2. Read book doc
    let bookRef  = null;
    let bookSnap = null;
    if (parentBookId) {
      bookRef  = doc(db, BOOKS_COLLECTION, parentBookId);
      bookSnap = await transaction.get(bookRef);
    }

    // ── PHASE 2: ALL WRITES ───────────────────────────────────────────────

    // 3. Update copy
    const copyUpdatePayload = {
      ...(newStatus    ? { status: newStatus }         : {}),
      ...(newCondition ? { condition: newCondition }   : {}),
      ...(shelfLocation ? { shelfLocation }            : {}),
      ...(rackNumber   ? { rackNumber }                : {}),
      ...(notes !== undefined ? { notes }              : {}),
      updatedAt: serverTimestamp(),
    };
    transaction.update(copyRef, copyUpdatePayload);

    // 4. Sync parent book counts (no new reads — all data already read above)
    if (bookRef && bookSnap && allCopiesSnap) {
      const pendingChanges = { [copyRef.id]: newStatus || copyData.status };
      applySyncBookCopyCounts(transaction, bookRef, bookSnap, allCopiesSnap.docs, pendingChanges);
    }
  });

  await logActivityRecord({
    user:   'Librarian',
    action: `updated copy ${copyId} (Status: ${newStatus}, Condition: ${newCondition})`,
    target: copyId,
    type:   'edit',
  });

  return true;
};

/**
  Archive Book (Soft Delete Title & All Copies) in Atomic Transaction.

  Read order (ALL reads before ANY write):
    1. Query all copies via getDocs (pre-transaction)
    2. Read each copy via transaction.get to lock it
    3. Read book doc
  Write order:
    4. Archive book doc
    5. Archive each copy
    6. Sync inventory counts
 */
export const archiveBook = async (bookId) => {
  // Pre-fetch copies outside the transaction
  const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  const copiesSnap  = await getDocs(copiesQuery);

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read each copy via transaction.get
    const copySnaps = [];
    for (const copyDocSnap of copiesSnap.docs) {
      const snap = await transaction.get(copyDocSnap.ref);
      copySnaps.push({ ref: copyDocSnap.ref, snap });
    }

    // 2. Read book doc
    const bookRef  = doc(db, BOOKS_COLLECTION, bookId);
    const bookSnap = await transaction.get(bookRef);

    // Validate no copy is currently borrowed
    const borrowed = copySnaps.filter((cs) => cs.snap.exists() && cs.snap.data().status === COPY_STATUSES.BORROWED);
    if (borrowed.length > 0) {
      throw new Error(
        `Cannot archive book title. ${borrowed.length} physical copies are currently borrowed by students.`
      );
    }

    // ── PHASE 2: ALL WRITES ───────────────────────────────────────────────

    // 3. Archive parent book doc
    transaction.update(bookRef, {
      isArchived: true,
      status:     BOOK_STATUSES.ARCHIVED,
      updatedAt:  serverTimestamp(),
    });

    // 4. Archive all copy documents
    const pendingChanges = {};
    for (const { ref, snap } of copySnaps) {
      if (snap.exists()) {
        transaction.update(ref, {
          status:    COPY_STATUSES.ARCHIVED,
          updatedAt: serverTimestamp(),
        });
        pendingChanges[ref.id] = COPY_STATUSES.ARCHIVED;
      }
    }

    // 5. Sync inventory counts using already-read data
    const bookSnapForSync = { ...bookSnap, data: () => ({ ...bookSnap.data(), isArchived: true }) };
    applySyncBookCopyCounts(
      transaction,
      bookRef,
      bookSnapForSync,
      copySnaps.map((cs) => cs.snap).filter((s) => s.exists()),
      pendingChanges
    );
  });

  await logActivityRecord({
    user:   'Librarian',
    action: `archived book title ${bookId}`,
    target: bookId,
    type:   'archive',
  });
};

/**
  Restore Archived Book & Copies in Atomic Transaction.

  Read order (ALL reads before ANY write):
    1. Read book doc
    2. Query all copies via getDocs (non-transactional, then read each via transaction.get)
  Write order:
    3. Restore book doc
    4. Restore each Archived copy
    5. Sync inventory counts (pure write using pre-read data)
 */
export const restoreBook = async (bookId) => {
  // Pre-fetch copies outside the transaction
  const copiesQuery  = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  const copiesSnap   = await getDocs(copiesQuery);

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read book doc
    const bookRef  = doc(db, BOOKS_COLLECTION, bookId);
    const bookSnap = await transaction.get(bookRef);

    // 2. Read each copy inside the transaction to lock them
    const copySnaps = [];
    for (const copyDocSnap of copiesSnap.docs) {
      const snap = await transaction.get(copyDocSnap.ref);
      copySnaps.push({ ref: copyDocSnap.ref, snap });
    }

    // ── PHASE 2: ALL WRITES ───────────────────────────────────────────────

    // 3. Restore book doc
    transaction.update(bookRef, {
      isArchived: false,
      status:     BOOK_STATUSES.AVAILABLE,
      updatedAt:  serverTimestamp(),
    });

    // 4. Restore each Archived copy
    const pendingChanges = {};
    for (const { ref, snap } of copySnaps) {
      const cData = snap.exists() ? snap.data() : null;
      if (cData && cData.status === COPY_STATUSES.ARCHIVED) {
        transaction.update(ref, {
          status:    COPY_STATUSES.AVAILABLE,
          updatedAt: serverTimestamp(),
        });
        pendingChanges[ref.id] = COPY_STATUSES.AVAILABLE;
      }
    }

    // 5. Sync inventory counts using already-read data (no new reads)
    const bookSnapForSync = { ...bookSnap, data: () => ({ ...bookSnap.data(), isArchived: false }) };
    applySyncBookCopyCounts(
      transaction,
      bookRef,
      bookSnapForSync,
      copySnaps.map((cs) => cs.snap).filter((s) => s.exists()),
      pendingChanges
    );
  });

  await logActivityRecord({
    user:   'Librarian',
    action: `restored archived book title ${bookId}`,
    target: bookId,
    type:   'restore',
  });
};

/**
  Permanent Hard Delete Book & Copies.

  Read order (ALL reads before ANY write):
    1. Query all copies (getDocs pre-transaction)
    2. Read each copy via transaction.get to lock it
    3. Read book doc
  Write order:
    4. Delete book doc
    5. Delete each copy doc
 */
export const deleteBookPermanent = async (bookId) => {
  // Pre-fetch copies outside the transaction
  const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  const copiesSnap  = await getDocs(copiesQuery);

  await runTransaction(db, async (transaction) => {
    // ── PHASE 1: ALL READS ────────────────────────────────────────────────

    // 1. Read each copy via transaction.get
    const copySnaps = [];
    for (const copyDocSnap of copiesSnap.docs) {
      const snap = await transaction.get(copyDocSnap.ref);
      copySnaps.push({ ref: copyDocSnap.ref, snap });
    }

    // 2. Read book doc
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    await transaction.get(bookRef); // lock the book doc

    // Validate no copy is borrowed
    const borrowed = copySnaps.filter((cs) => cs.snap.exists() && cs.snap.data().status === COPY_STATUSES.BORROWED);
    if (borrowed.length > 0) {
      throw new Error(`Cannot delete book title. ${borrowed.length} physical copies are currently borrowed.`);
    }

    // ── PHASE 2: ALL WRITES ───────────────────────────────────────────────

    // 3. Delete book doc
    transaction.delete(bookRef);

    // 4. Delete each copy doc
    for (const { ref } of copySnaps) {
      transaction.delete(ref);
    }
  });

  await logActivityRecord({
    user:   'Librarian',
    action: `permanently deleted book ${bookId} and physical copies`,
    target: bookId,
    type:   'delete',
  });
};
