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
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebaseConfig';
import { INITIAL_MOCK_BOOKS, generateCopiesForBook, BOOK_STATUSES, COPY_STATUSES } from '../../models/bookModel';

const BOOKS_COLLECTION = 'books';
const COPIES_COLLECTION = 'bookCopies';
const LOCAL_BOOKS_STORAGE_KEY = 'borrow_admin_local_books';
const LOCAL_COPIES_STORAGE_KEY = 'borrow_admin_local_copies';

/**
 * Initialize local storage memory fallback if empty
 */
const getInitialLocalData = () => {
  const storedBooks = localStorage.getItem(LOCAL_BOOKS_STORAGE_KEY);
  let books = [];
  if (storedBooks) {
    try {
      books = JSON.parse(storedBooks);
    } catch {
      books = INITIAL_MOCK_BOOKS;
    }
  } else {
    books = INITIAL_MOCK_BOOKS;
    localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(books));
  }

  const storedCopies = localStorage.getItem(LOCAL_COPIES_STORAGE_KEY);
  let copies = [];
  if (storedCopies) {
    try {
      copies = JSON.parse(storedCopies);
    } catch {
      copies = books.flatMap((b) => generateCopiesForBook(b.id, b.isbn, b.totalCopies, b.borrowedCopies, b.damagedCopies));
    }
  } else {
    copies = books.flatMap((b) => generateCopiesForBook(b.id, b.isbn, b.totalCopies, b.borrowedCopies, b.damagedCopies));
    localStorage.setItem(LOCAL_COPIES_STORAGE_KEY, JSON.stringify(copies));
  }

  return { books, copies };
};

/**
 * Compress Image File using Canvas before upload
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
 * Upload Book Cover Image to Firebase Storage or Base64 fallback
 */
export const uploadBookCover = async (file, isbn) => {
  if (!file) return null;

  const compressedFile = await compressImage(file);

  if (isFirebaseConfigured) {
    try {
      const cleanIsbn = isbn ? isbn.replace(/[^0-9X]/gi, '') : Date.now();
      const storageRef = ref(storage, `book-covers/cover_${cleanIsbn}_${Date.now()}.webp`);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase storage upload failed, creating object URL fallback:', err);
    }
  }

  // Fallback to local DataURL for dev environment
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(compressedFile);
  });
};

/**
 * Check if an ISBN already exists in the catalog (excluding currentBookId)
 */
export const checkIsbnExists = async (isbn, currentBookId = null) => {
  const targetIsbn = isbn.trim().replace(/[^0-9X]/gi, '');
  if (!targetIsbn) return false;

  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, BOOKS_COLLECTION), where('isbn', '==', targetIsbn));
      const querySnapshot = await getDocs(q);
      const matches = querySnapshot.docs.filter((doc) => doc.id !== currentBookId);
      return matches.length > 0;
    } catch (err) {
      console.warn('Firestore query check failed:', err);
    }
  }

  const { books } = getInitialLocalData();
  return books.some(
    (b) => b.id !== currentBookId && b.isbn.replace(/[^0-9X]/gi, '') === targetIsbn && !b.isArchived
  );
};

/**
 * Fetch All Books from Firestore or Local Cache
 */
export const getAllBooks = async () => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, BOOKS_COLLECTION), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }
    } catch (err) {
      console.warn('Firestore getDocs failed, loading local cache:', err);
    }
  }

  const { books } = getInitialLocalData();
  return books;
};

/**
 * Fetch Book Copies for a specific Book ID
 */
export const getBookCopies = async (bookId) => {
  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, COPIES_COLLECTION), where('bookId', '==', bookId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }
    } catch (err) {
      console.warn('Firestore copies query failed:', err);
    }
  }

  const { copies } = getInitialLocalData();
  return copies.filter((c) => c.bookId === bookId);
};

/**
 * Add New Book & Create Physical Copies in Firestore / Local Cache
 */
export const createBook = async (bookData, coverFile) => {
  let coverUrl = bookData.coverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500';

  if (coverFile) {
    const uploadedUrl = await uploadBookCover(coverFile, bookData.isbn);
    if (uploadedUrl) coverUrl = uploadedUrl;
  }

  const totalCopies = parseInt(bookData.totalCopies || 1, 10);
  const availableCopies = totalCopies;
  const borrowedCopies = 0;
  const archivedCopies = 0;
  const damagedCopies = 0;

  const newBookPayload = {
    ...bookData,
    coverUrl,
    totalCopies,
    availableCopies,
    borrowedCopies,
    archivedCopies,
    damagedCopies,
    status: availableCopies > 0 ? BOOK_STATUSES.AVAILABLE : BOOK_STATUSES.OUT_OF_STOCK,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let newBookId = `bk-${Date.now()}`;

  if (isFirebaseConfigured) {
    try {
      const docRef = await addDoc(collection(db, BOOKS_COLLECTION), {
        ...newBookPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      newBookId = docRef.id;

      // Create Physical Copies in bookCopies collection
      const copies = generateCopiesForBook(newBookId, bookData.isbn, totalCopies);
      for (const copy of copies) {
        await setDoc(doc(db, COPIES_COLLECTION, copy.copyId), {
          ...copy,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return { id: newBookId, ...newBookPayload, copies };
    } catch (err) {
      console.warn('Firestore createBook failed, saving to local state:', err);
    }
  }

  // Local fallback
  const { books, copies: localCopies } = getInitialLocalData();
  const createdBook = { id: newBookId, ...newBookPayload };
  const newCopies = generateCopiesForBook(newBookId, bookData.isbn, totalCopies);

  const updatedBooks = [createdBook, ...books];
  const updatedCopies = [...newCopies, ...localCopies];

  localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
  localStorage.setItem(LOCAL_COPIES_STORAGE_KEY, JSON.stringify(updatedCopies));

  return { ...createdBook, copies: newCopies };
};

/**
 * Update Existing Book Details
 */
export const updateBook = async (bookId, updateFields, coverFile) => {
  let coverUrl = updateFields.coverUrl;

  if (coverFile) {
    const uploadedUrl = await uploadBookCover(coverFile, updateFields.isbn);
    if (uploadedUrl) coverUrl = uploadedUrl;
  }

  const updatedPayload = {
    ...updateFields,
    ...(coverUrl ? { coverUrl } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured) {
    try {
      const bookRef = doc(db, BOOKS_COLLECTION, bookId);
      await updateDoc(bookRef, {
        ...updatedPayload,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore updateBook failed:', err);
    }
  }

  // Local cache update
  const { books } = getInitialLocalData();
  const updatedBooks = books.map((b) => (b.id === bookId ? { ...b, ...updatedPayload } : b));
  localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));

  return { id: bookId, ...updatedPayload };
};

/**
 * Archive Book (Soft Delete)
 */
export const archiveBook = async (bookId) => {
  if (isFirebaseConfigured) {
    try {
      const bookRef = doc(db, BOOKS_COLLECTION, bookId);
      await updateDoc(bookRef, {
        isArchived: true,
        status: BOOK_STATUSES.ARCHIVED,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore archiveBook failed:', err);
    }
  }

  const { books } = getInitialLocalData();
  const updatedBooks = books.map((b) =>
    b.id === bookId ? { ...b, isArchived: true, status: BOOK_STATUSES.ARCHIVED } : b
  );
  localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
};

/**
 * Restore Archived Book
 */
export const restoreBook = async (bookId) => {
  if (isFirebaseConfigured) {
    try {
      const bookRef = doc(db, BOOKS_COLLECTION, bookId);
      await updateDoc(bookRef, {
        isArchived: false,
        status: BOOK_STATUSES.AVAILABLE,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Firestore restoreBook failed:', err);
    }
  }

  const { books } = getInitialLocalData();
  const updatedBooks = books.map((b) =>
    b.id === bookId ? { ...b, isArchived: false, status: BOOK_STATUSES.AVAILABLE } : b
  );
  localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
};

/**
 * Permanent Hard Delete Book
 */
export const deleteBookPermanent = async (bookId) => {
  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, BOOKS_COLLECTION, bookId));
    } catch (err) {
      console.warn('Firestore deleteDoc failed:', err);
    }
  }

  const { books, copies } = getInitialLocalData();
  const filteredBooks = books.filter((b) => b.id !== bookId);
  const filteredCopies = copies.filter((c) => c.bookId !== bookId);

  localStorage.setItem(LOCAL_BOOKS_STORAGE_KEY, JSON.stringify(filteredBooks));
  localStorage.setItem(LOCAL_COPIES_STORAGE_KEY, JSON.stringify(filteredCopies));
};
