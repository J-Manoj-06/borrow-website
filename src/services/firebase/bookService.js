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
  Helper to count physical copies and update parent Book document atomically inside a transaction
 */
export const syncBookCopyCounts = async (transaction, bookId) => {
  const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
  const querySnap = await getDocs(copiesQuery);

  let availableCopies = 0;
  let borrowedCopies = 0;
  let reservedCopies = 0;
  let damagedCopies = 0;
  let lostCopies = 0;
  let archivedCopies = 0;
  let maintenanceCopies = 0;
  let totalCopies = 0;

  querySnap.docs.forEach((docSnap) => {
    const c = docSnap.data();
    if (c.status === COPY_STATUSES.ARCHIVED) {
      archivedCopies += 1;
    } else {
      totalCopies += 1;
      if (c.status === COPY_STATUSES.AVAILABLE) availableCopies += 1;
      if (c.status === COPY_STATUSES.BORROWED) borrowedCopies += 1;
      if (c.status === COPY_STATUSES.RESERVED) reservedCopies += 1;
      if (c.status === COPY_STATUSES.DAMAGED) damagedCopies += 1;
      if (c.status === COPY_STATUSES.LOST) lostCopies += 1;
      if (c.status === COPY_STATUSES.MAINTENANCE) maintenanceCopies += 1;
    }
  });

  const bookRef = doc(db, BOOKS_COLLECTION, bookId);
  const bookSnap = await transaction.get(bookRef);

  if (bookSnap.exists()) {
    const isArchived = Boolean(bookSnap.data().isArchived);

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
  }

  return {
    totalCopies,
    availableCopies,
    borrowedCopies,
    reservedCopies,
    damagedCopies,
    lostCopies,
    archivedCopies,
    maintenanceCopies,
  };
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
  Update Book Details and Copy Counts using Atomic Firestore Transaction
 */
export const updateBook = async (bookId, updateFields, coverFile) => {
  let coverUrl = updateFields.coverUrl;

  if (coverFile) {
    const uploadedUrl = await uploadBookCover(coverFile, updateFields.isbn);
    if (uploadedUrl) coverUrl = uploadedUrl;
  }

  const newTotalCopies = updateFields.totalCopies ? parseInt(updateFields.totalCopies, 10) : null;

  await runTransaction(db, async (transaction) => {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    const bookSnap = await transaction.get(bookRef);

    if (!bookSnap.exists()) {
      throw new Error(`Book ${bookId} does not exist in Firestore.`);
    }

    const currentBookData = bookSnap.data();
    const currentTotal = Number(currentBookData.totalCopies || 0);

    const updatedMetadata = {
      ...updateFields,
      ...(coverUrl ? { coverUrl } : {}),
      updatedAt: serverTimestamp(),
    };

    // If totalCopies count has changed, adjust physical copy documents
    if (newTotalCopies !== null && newTotalCopies !== currentTotal) {
      // Query existing copies
      const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
      const querySnap = await getDocs(copiesQuery);
      const existingCopies = querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (newTotalCopies > currentTotal) {
        // Increase copy count: generate new copies starting from max copyNumber
        const maxNum = existingCopies.reduce((max, c) => Math.max(max, Number(c.copyNumber || 0)), 0);
        const addedCount = newTotalCopies - currentTotal;

        const newCopies = generateCopiesForBook(
          bookId,
          updateFields.isbn || currentBookData.isbn,
          addedCount,
          maxNum + 1,
          updateFields.shelfNumber || currentBookData.shelfNumber || 'CS-01',
          updateFields.rackNumber || currentBookData.rackNumber || 'R-01'
        );

        for (const copy of newCopies) {
          const copyRef = doc(db, COPIES_COLLECTION, copy.copyId);
          transaction.set(copyRef, {
            ...copy,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } else if (newTotalCopies < currentTotal) {
        // Decrease copy count: only remove Available copies
        const diff = currentTotal - newTotalCopies;
        const availableCopies = existingCopies.filter((c) => c.status === COPY_STATUSES.AVAILABLE);

        if (availableCopies.length < diff) {
          throw new Error(
            `Cannot reduce copy count by ${diff}. Only ${availableCopies.length} copies are currently Available on shelf. Borrowed or Damaged copies cannot be deleted.`
          );
        }

        // Delete 'diff' number of Available copy documents
        const copiesToRemove = availableCopies.slice(0, diff);
        for (const copy of copiesToRemove) {
          const copyRef = doc(db, COPIES_COLLECTION, copy.id || copy.copyId);
          transaction.delete(copyRef);
        }
      }
    }

    transaction.update(bookRef, updatedMetadata);
    await syncBookCopyCounts(transaction, bookId);
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `updated catalog details for book "${updateFields.title || bookId}"`,
    target: bookId,
    type: 'edit',
  });

  return { id: bookId, ...updateFields };
};

/**
  Update Status or Location of an Individual Physical Book Copy in an Atomic Transaction
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

  await runTransaction(db, async (transaction) => {
    const copySnap = await transaction.get(copyRef);
    if (!copySnap.exists()) {
      throw new Error(`Physical Copy ${copyId} not found in Firestore.`);
    }

    const copyData = copySnap.data();
    parentBookId = copyData.bookId;

    if (copyData.status === COPY_STATUSES.BORROWED && newStatus !== COPY_STATUSES.BORROWED && newStatus !== COPY_STATUSES.RETURNED) {
      throw new Error(`Physical Copy ${copyId} is currently Borrowed by a student. Mark book returned first.`);
    }

    const copyUpdatePayload = {
      ...(newStatus ? { status: newStatus } : {}),
      ...(newCondition ? { condition: newCondition } : {}),
      ...(shelfLocation ? { shelfLocation } : {}),
      ...(rackNumber ? { rackNumber } : {}),
      ...(notes !== undefined ? { notes } : {}),
      updatedAt: serverTimestamp(),
    };

    transaction.update(copyRef, copyUpdatePayload);

    // Sync parent book counts atomically
    if (parentBookId) {
      await syncBookCopyCounts(transaction, parentBookId);
    }
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `updated copy ${copyId} (Status: ${newStatus}, Condition: ${newCondition})`,
    target: copyId,
    type: 'edit',
  });

  return true;
};

/**
  Archive Book (Soft Delete Title & All Copies) in Atomic Transaction
 */
export const archiveBook = async (bookId) => {
  await runTransaction(db, async (transaction) => {
    // 1. Verify no copy is currently borrowed
    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    const querySnap = await getDocs(copiesQuery);
    const copies = querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const borrowed = copies.filter((c) => c.status === COPY_STATUSES.BORROWED);
    if (borrowed.length > 0) {
      throw new Error(
        `Cannot archive book title. ${borrowed.length} physical copies are currently borrowed by students.`
      );
    }

    // 2. Archive parent book doc
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    transaction.update(bookRef, {
      isArchived: true,
      status: BOOK_STATUSES.ARCHIVED,
      updatedAt: serverTimestamp(),
    });

    // 3. Archive all copy documents
    for (const copy of copies) {
      const copyRef = doc(db, COPIES_COLLECTION, copy.id || copy.copyId);
      transaction.update(copyRef, {
        status: COPY_STATUSES.ARCHIVED,
        updatedAt: serverTimestamp(),
      });
    }
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `archived book title ${bookId}`,
    target: bookId,
    type: 'archive',
  });
};

/**
  Restore Archived Book & Copies in Atomic Transaction
 */
export const restoreBook = async (bookId) => {
  await runTransaction(db, async (transaction) => {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    transaction.update(bookRef, {
      isArchived: false,
      status: BOOK_STATUSES.AVAILABLE,
      updatedAt: serverTimestamp(),
    });

    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    const querySnap = await getDocs(copiesQuery);

    for (const copyDoc of querySnap.docs) {
      const cData = copyDoc.data();
      if (cData.status === COPY_STATUSES.ARCHIVED) {
        transaction.update(copyDoc.ref, {
          status: COPY_STATUSES.AVAILABLE,
          updatedAt: serverTimestamp(),
        });
      }
    }

    await syncBookCopyCounts(transaction, bookId);
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `restored archived book title ${bookId}`,
    target: bookId,
    type: 'restore',
  });
};

/**
  Permanent Hard Delete Book & Copies
 */
export const deleteBookPermanent = async (bookId) => {
  await runTransaction(db, async (transaction) => {
    const copiesQuery = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
    const querySnap = await getDocs(copiesQuery);
    const copies = querySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const borrowed = copies.filter((c) => c.status === COPY_STATUSES.BORROWED);
    if (borrowed.length > 0) {
      throw new Error(`Cannot delete book title. ${borrowed.length} physical copies are currently borrowed.`);
    }

    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    transaction.delete(bookRef);

    for (const copy of copies) {
      const copyRef = doc(db, COPIES_COLLECTION, copy.id || copy.copyId);
      transaction.delete(copyRef);
    }
  });

  await logActivityRecord({
    user: 'Librarian',
    action: `permanently deleted book ${bookId} and physical copies`,
    target: bookId,
    type: 'delete',
  });
};
