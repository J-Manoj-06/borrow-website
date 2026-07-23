import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeToTransactions,
  issueBookTransaction as issueService,
  returnBookTransaction as returnService,
  renewBookTransaction as renewService,
  getReturnReminders,
} from '../services/firebase/transactionService';
import { TRANSACTION_STATUSES } from '../models/transactionModel';
import differenceInDays from 'date-fns/differenceInDays';

export const TransactionContext = createContext(null);

const defaultFilters = {
  status: 'All',
  department: 'All',
  year: 'All',
  category: 'All',
  overdueOnly: false,
  returnedOnly: false,
  sortBy: 'Newest',
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [targetTransaction, setTargetTransaction] = useState(null);

  // Subscribe to Firestore Real-Time Snapshot
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTransactions((data) => {
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute live statistics metrics & dynamic overdue status
  const { processedTransactions, stats } = useMemo(() => {
    let booksIssuedToday = 0;
    let booksReturnedToday = 0;
    let currentlyBorrowed = 0;
    let overdueBooks = 0;
    let pendingPickups = 0;

    const todayStr = new Date().toDateString();
    const now = new Date();

    const processed = transactions.map((t) => {
      let isOverdue = false;
      let daysOverdue = 0;
      let daysRemaining = 0;

      if (t.status === TRANSACTION_STATUSES.ISSUED && t.dueDate) {
        const due = new Date(t.dueDate);
        const diff = differenceInDays(due, now);
        if (diff < 0) {
          isOverdue = true;
          daysOverdue = Math.abs(diff);
        } else {
          daysRemaining = diff;
        }
      }

      const status = isOverdue ? TRANSACTION_STATUSES.OVERDUE : t.status;

      // Stats accumulation
      if (t.issueDate && new Date(t.issueDate).toDateString() === todayStr) {
        booksIssuedToday += 1;
      }
      if (t.returnDate && new Date(t.returnDate).toDateString() === todayStr) {
        booksReturnedToday += 1;
      }
      if (status === TRANSACTION_STATUSES.ISSUED) {
        currentlyBorrowed += 1;
      } else if (status === TRANSACTION_STATUSES.OVERDUE) {
        currentlyBorrowed += 1;
        overdueBooks += 1;
      } else if (status === TRANSACTION_STATUSES.PENDING_PICKUP) {
        pendingPickups += 1;
      }

      return {
        ...t,
        computedStatus: status,
        isOverdue,
        daysOverdue,
        daysRemaining,
      };
    });

    return {
      processedTransactions: processed,
      stats: {
        booksIssuedToday,
        booksReturnedToday,
        currentlyBorrowed,
        overdueBooks,
        pendingPickups,
      },
    };
  }, [transactions]);

  // Filter & Search Logic
  const filteredTransactions = useMemo(() => {
    return processedTransactions
      .filter((t) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesStudent = t.studentName?.toLowerCase().includes(q);
          const matchesReg = t.registerNumber?.toLowerCase().includes(q);
          const matchesTitle = t.bookTitle?.toLowerCase().includes(q);
          const matchesCopy = t.bookCopyId?.toLowerCase().includes(q);
          const matchesTxn = (t.transactionId || t.id)?.toLowerCase().includes(q);
          const matchesIsbn = t.isbn?.toLowerCase().includes(q);

          if (
            !matchesStudent &&
            !matchesReg &&
            !matchesTitle &&
            !matchesCopy &&
            !matchesTxn &&
            !matchesIsbn
          ) {
            return false;
          }
        }

        // Status Filter
        if (filterOptions.status !== 'All' && t.computedStatus !== filterOptions.status) {
          return false;
        }

        // Overdue Only
        if (filterOptions.overdueOnly && !t.isOverdue) return false;

        // Returned Only
        if (filterOptions.returnedOnly && t.computedStatus !== TRANSACTION_STATUSES.RETURNED) return false;

        // Department
        if (filterOptions.department !== 'All' && t.department !== filterOptions.department) {
          return false;
        }

        // Category
        if (filterOptions.category !== 'All' && t.category !== filterOptions.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b.issueDate || b.createdAt) - new Date(a.issueDate || a.createdAt);
        }
        if (filterOptions.sortBy === 'Oldest') {
          return new Date(a.issueDate || a.createdAt) - new Date(b.issueDate || b.createdAt);
        }
        if (filterOptions.sortBy === 'Due Date') {
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        }
        if (filterOptions.sortBy === 'Student Name') {
          return (a.studentName || '').localeCompare(b.studentName || '');
        }
        return 0;
      });
  }, [processedTransactions, searchQuery, filterOptions]);

  // Open Issue Modal
  const openIssueModal = useCallback(() => {
    setIssueDialogOpen(true);
  }, []);

  // Open Return Modal
  const openReturnModal = useCallback((transaction) => {
    setTargetTransaction(transaction);
    setReturnDialogOpen(true);
  }, []);

  // Select Transaction for Details Drawer
  const selectTransactionForDetails = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setDrawerOpen(true);
  }, []);

  // Handle Issue Action (Atomic Firestore Transaction)
  const handleIssueBook = useCallback(async (issueData, adminName) => {
    try {
      const created = await issueService(issueData, adminName);
      toast.success(`Book issued successfully!`);
      setIssueDialogOpen(false);
      return created;
    } catch (err) {
      toast.error(err.message || 'Failed to issue book');
      throw err;
    }
  }, []);

  // Handle Return Action (Atomic Firestore Transaction & Inspection)
  const handleReturnBook = useCallback(async (transactionId, condition, notes, adminName) => {
    try {
      await returnService(transactionId, condition, notes, adminName);
      toast.success('Book returned and checked into inventory!');
      setReturnDialogOpen(false);
      setTargetTransaction(null);
    } catch (err) {
      toast.error(err.message || 'Failed to mark return');
      throw err;
    }
  }, []);

  // Handle Renew Action (Atomic Firestore Transaction & Queue Validation)
  const handleRenewBook = useCallback(async (transactionId, extensionDays = 14, adminName) => {
    try {
      const res = await renewService(transactionId, extensionDays, adminName);
      toast.success(`Loan renewed by ${extensionDays} days! New due date: ${new Date(res.newDueDate).toLocaleDateString()}`);
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to renew loan');
      throw err;
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    transactions: processedTransactions,
    filteredTransactions,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    stats,
    selectedTransaction,
    setSelectedTransaction,
    drawerOpen,
    setDrawerOpen,
    issueDialogOpen,
    setIssueDialogOpen,
    returnDialogOpen,
    setReturnDialogOpen,
    targetTransaction,
    openIssueModal,
    openReturnModal,
    selectTransactionForDetails,
    issueBook: handleIssueBook,
    returnBook: handleReturnBook,
    renewBook: handleRenewBook,
    getReminders: getReturnReminders,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export default TransactionProvider;
