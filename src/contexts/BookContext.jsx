import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeToBooks,
  subscribeToBookCopies,
  getBookCopies,
  createBook,
  updateBook as updateBookService,
  updateBookCopyStatus,
  archiveBook as archiveBookService,
  restoreBook as restoreBookService,
  deleteBookPermanent,
  checkIsbnExists,
} from '../services/firebase/bookService';
import { BOOK_STATUSES } from '../models/bookModel';

export const BookContext = createContext(null);

const defaultFilters = {
  category: 'All',
  department: 'All',
  availability: 'All',
  language: 'All',
  status: 'All',
  sortBy: 'Newest',
  showArchived: false,
};

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookCopies, setSelectedBookCopies] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Real-Time Firestore Snapshot Subscription for Books
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToBooks((data) => {
      setBooks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Real-Time Firestore Snapshot Subscription for Physical Copies of Selected Book
  useEffect(() => {
    if (!selectedBook?.id) {
      setSelectedBookCopies([]);
      return () => {};
    }
    const unsubscribe = subscribeToBookCopies(selectedBook.id, (copies) => {
      setSelectedBookCopies(copies);
    });
    return () => unsubscribe();
  }, [selectedBook?.id]);

  // Compute live statistics metrics defensively from Firestore data
  const stats = useMemo(() => {
    let totalTitles = 0;
    let totalCopies = 0;
    let availableCopies = 0;
    let borrowedCopies = 0;
    let damagedCopies = 0;
    let lostCopies = 0;
    let archivedBooks = 0;

    (books || []).forEach((b) => {
      if (b?.isArchived) {
        archivedBooks += 1;
      } else {
        totalTitles += 1;
        availableCopies += Number(b?.availableCopies ?? 0);
        borrowedCopies += Number(b?.borrowedCopies ?? 0);
        damagedCopies += Number(b?.damagedCopies ?? 0);
        lostCopies += Number(b?.lostCopies ?? 0);
        totalCopies += Number(
          b?.totalCopies ??
            (Number(b?.availableCopies ?? 0) +
              Number(b?.borrowedCopies ?? 0) +
              Number(b?.damagedCopies ?? 0) +
              Number(b?.lostCopies ?? 0))
        );
      }
    });

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      borrowedCopies,
      damagedCopies,
      damagedBooks: damagedCopies,
      lostCopies,
      archivedBooks,
    };
  }, [books]);

  // Filter & Search Logic
  const filteredBooks = useMemo(() => {
    return (books || [])
      .filter((b) => {
        // Soft delete / archive filter
        if (!filterOptions.showArchived && b?.isArchived) return false;
        if (filterOptions.showArchived && !b?.isArchived) return false;

        // Search Query (Title, ISBN, Author, Category, CustomCategory, Publisher, Keywords)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = b?.title?.toLowerCase().includes(q);
          const matchesIsbn = b?.isbn?.toLowerCase().includes(q);
          const matchesAuthor = b?.author?.toLowerCase().includes(q);
          const matchesCategory = b?.category?.toLowerCase().includes(q);
          const matchesCustomCategory = b?.customCategory?.toLowerCase().includes(q);
          const matchesPublisher = b?.publisher?.toLowerCase().includes(q);
          const matchesKeywords = b?.keywords?.some((k) => k?.toLowerCase().includes(q));

          if (
            !matchesTitle &&
            !matchesIsbn &&
            !matchesAuthor &&
            !matchesCategory &&
            !matchesCustomCategory &&
            !matchesPublisher &&
            !matchesKeywords
          ) {
            return false;
          }
        }

        // Category Filter
        if (filterOptions.category !== 'All' && b?.category !== filterOptions.category && b?.customCategory !== filterOptions.category) {
          return false;
        }

        // Department Filter
        if (filterOptions.department !== 'All' && b?.department !== filterOptions.department) {
          return false;
        }

        // Status Filter
        if (filterOptions.status !== 'All' && b?.status !== filterOptions.status) {
          return false;
        }

        // Language Filter
        if (filterOptions.language !== 'All' && b?.language !== filterOptions.language) {
          return false;
        }

        // Availability Filter
        if (filterOptions.availability === 'In Stock' && (b?.availableCopies ?? 0) <= 0) return false;
        if (filterOptions.availability === 'Low Stock' && ((b?.availableCopies ?? 0) <= 0 || (b?.availableCopies ?? 0) > 2)) return false;
        if (filterOptions.availability === 'Out of Stock' && (b?.availableCopies ?? 0) > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
        }
        if (filterOptions.sortBy === 'Oldest') {
          return new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0);
        }
        if (filterOptions.sortBy === 'Alphabetical') {
          return (a?.title || '').localeCompare(b?.title || '');
        }
        if (filterOptions.sortBy === 'Most Borrowed') {
          return (b?.borrowedCopies ?? 0) - (a?.borrowedCopies ?? 0);
        }
        return 0;
      });
  }, [books, searchQuery, filterOptions]);

  // Select Book for Drawer View & Fetch Copies
  const selectBookForDetails = useCallback(async (book) => {
    setSelectedBook(book);
    setDrawerOpen(true);
    try {
      const copies = await getBookCopies(book.id);
      setSelectedBookCopies(copies);
    } catch {
      setSelectedBookCopies([]);
    }
  }, []);

  // Add Book Action
  const handleAddBook = useCallback(async (bookData, coverFile) => {
    const isbnExists = await checkIsbnExists(bookData.isbn);
    if (isbnExists) {
      toast.error(`A book with ISBN ${bookData.isbn} already exists in the catalog!`);
      throw new Error('Duplicate ISBN');
    }

    try {
      const created = await createBook(bookData, coverFile);
      toast.success(`"${created.title}" added to inventory successfully!`);
      return created;
    } catch (err) {
      toast.error('Failed to create book in Firestore');
      throw err;
    }
  }, []);

  // Update Book Action
  const handleUpdateBook = useCallback(async (bookId, bookData, coverFile) => {
    const isbnExists = await checkIsbnExists(bookData.isbn, bookId);
    if (isbnExists) {
      toast.error(`Another book with ISBN ${bookData.isbn} already exists!`);
      throw new Error('Duplicate ISBN');
    }

    try {
      const updated = await updateBookService(bookId, bookData, coverFile);
      toast.success(`Book updated successfully!`);
      if (selectedBook?.id === bookId) {
        setSelectedBook((prev) => ({ ...prev, ...updated }));
      }
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update book');
      throw err;
    }
  }, [selectedBook]);

  // Update Individual Physical Book Copy Status / Location Action
  const handleUpdateCopyStatus = useCallback(
    async (copyId, newStatus, newCondition, shelfLocation, rackNumber, notes) => {
      try {
        await updateBookCopyStatus(copyId, newStatus, newCondition, shelfLocation, rackNumber, notes);
        toast.success(`Physical copy ${copyId} updated!`);
      } catch (err) {
        toast.error(err.message || 'Failed to update copy status');
        throw err;
      }
    },
    []
  );

  // Archive Book Action (Soft Delete)
  const handleArchiveBook = useCallback(async (bookId) => {
    try {
      await archiveBookService(bookId);
      toast.success('Book moved to Archive.');
    } catch (err) {
      toast.error(err.message || 'Failed to archive book');
    }
  }, []);

  // Restore Book Action
  const handleRestoreBook = useCallback(async (bookId) => {
    try {
      await restoreBookService(bookId);
      toast.success('Book restored to active inventory.');
    } catch (err) {
      toast.error(err.message || 'Failed to restore book');
    }
  }, []);

  // Permanent Delete Action
  const handleDeleteBook = useCallback(async (bookId) => {
    try {
      await deleteBookPermanent(bookId);
      toast.success('Book permanently removed.');
      if (selectedBook?.id === bookId) {
        setDrawerOpen(false);
        setSelectedBook(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete book');
    }
  }, [selectedBook]);

  // Duplicate Book Action
  const handleDuplicateBook = useCallback(async (book) => {
    const newIsbn = `${book.isbn.slice(0, -3)}${Math.floor(100 + Math.random() * 900)}`;
    const duplicatePayload = {
      ...book,
      title: `${book.title} (Copy)`,
      isbn: newIsbn,
    };
    delete duplicatePayload.id;

    try {
      const created = await createBook(duplicatePayload, null);
      toast.success(`Duplicated "${created.title}"!`);
    } catch {
      toast.error('Failed to duplicate book');
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    books,
    filteredBooks,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    stats,
    selectedBook,
    selectedBookCopies,
    drawerOpen,
    setDrawerOpen,
    formModalOpen,
    setFormModalOpen,
    editingBook,
    setEditingBook,
    selectBookForDetails,
    addBook: handleAddBook,
    updateBook: handleUpdateBook,
    updateCopyStatus: handleUpdateCopyStatus,
    archiveBook: handleArchiveBook,
    restoreBook: handleRestoreBook,
    deleteBook: handleDeleteBook,
    duplicateBook: handleDuplicateBook,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
};

export default BookProvider;
