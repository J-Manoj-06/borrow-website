import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeToStudents } from '../services/firebase/studentService';
import { STUDENT_STATUSES } from '../models/studentModel';
import useTransactions from '../hooks/useTransactions';
import useBorrowRequests from '../hooks/useBorrowRequests';

export const StudentContext = createContext(null);

const defaultFilters = {
  department: 'All',
  year: 'All',
  status: 'All',
  currentlyBorrowingOnly: false,
  hasOverdueOnly: false,
  pendingRequestsOnly: false,
  sortBy: 'Alphabetical',
};

export const StudentProvider = ({ children }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { transactions } = useTransactions();
  const { requests } = useBorrowRequests();

  // Subscribe to real-time students snapshot
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToStudents((data) => {
      setStudents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute live joined student profiles with active transactions & requests
  const { processedStudents, stats } = useMemo(() => {
    let totalStudents = 0;
    let activeBorrowers = 0;
    let studentsWithPendingRequests = 0;
    let studentsWithOverdueBooks = 0;
    let booksCurrentlyIssued = 0;
    let newRegistrations = 0;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const processed = students.map((stu) => {
      totalStudents += 1;

      // Find active transactions for student
      const studentTxns = transactions.filter(
        (t) => t.studentId === stu.studentId || t.registerNumber === stu.registerNumber
      );

      const activeTxns = studentTxns.filter(
        (t) => t.status === 'Issued' || t.status === 'Overdue' || t.computedStatus === 'Issued' || t.computedStatus === 'Overdue'
      );

      const overdueTxns = studentTxns.filter((t) => t.isOverdue || t.status === 'Overdue' || t.computedStatus === 'Overdue');

      // Find pending requests for student
      const studentReqs = requests.filter(
        (r) => (r.studentId === stu.studentId || r.registerNumber === stu.registerNumber) && r.status === 'Pending'
      );

      const hasBorrowed = activeTxns.length > 0;
      const hasPending = studentReqs.length > 0;
      const hasOverdue = overdueTxns.length > 0;

      if (hasBorrowed) activeBorrowers += 1;
      if (hasPending) studentsWithPendingRequests += 1;
      if (hasOverdue) studentsWithOverdueBooks += 1;
      booksCurrentlyIssued += activeTxns.length;

      if (stu.accountCreated && new Date(stu.accountCreated) >= thirtyDaysAgo) {
        newRegistrations += 1;
      }

      // Compute dynamic status
      let computedStatus = STUDENT_STATUSES.ACTIVE;
      if (hasOverdue) {
        computedStatus = STUDENT_STATUSES.OVERDUE;
      } else if (hasBorrowed) {
        computedStatus = STUDENT_STATUSES.HAS_BORROWED;
      } else if (hasPending) {
        computedStatus = STUDENT_STATUSES.PENDING_REQUESTS;
      }

      return {
        ...stu,
        computedStatus,
        activeTxns,
        studentTxns,
        studentReqs,
        hasBorrowed,
        hasPending,
        hasOverdue,
        borrowedCount: activeTxns.length,
        pendingCount: studentReqs.length,
      };
    });

    return {
      processedStudents: processed,
      stats: {
        totalStudents,
        activeBorrowers,
        studentsWithPendingRequests,
        studentsWithOverdueBooks,
        booksCurrentlyIssued,
        newRegistrations,
      },
    };
  }, [students, transactions, requests]);

  // Filter & Search Logic
  const filteredStudents = useMemo(() => {
    return processedStudents
      .filter((s) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = (s.fullName || s.name)?.toLowerCase().includes(q);
          const matchesReg = s.registerNumber?.toLowerCase().includes(q);
          const matchesDept = s.department?.toLowerCase().includes(q);
          const matchesEmail = s.email?.toLowerCase().includes(q);
          const matchesYear = s.year?.toLowerCase().includes(q);

          if (!matchesName && !matchesReg && !matchesDept && !matchesEmail && !matchesYear) {
            return false;
          }
        }

        // Status Filter
        if (filterOptions.status !== 'All' && s.computedStatus !== filterOptions.status) {
          return false;
        }

        // Department Filter
        if (filterOptions.department !== 'All' && s.department !== filterOptions.department) {
          return false;
        }

        // Year Filter
        if (filterOptions.year !== 'All' && s.year !== filterOptions.year) {
          return false;
        }

        // Toggles
        if (filterOptions.currentlyBorrowingOnly && !s.hasBorrowed) return false;
        if (filterOptions.hasOverdueOnly && !s.hasOverdue) return false;
        if (filterOptions.pendingRequestsOnly && !s.hasPending) return false;

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Alphabetical') {
          return (a.fullName || a.name).localeCompare(b.fullName || b.name);
        }
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b.accountCreated || 0) - new Date(a.accountCreated || 0);
        }
        if (filterOptions.sortBy === 'Oldest') {
          return new Date(a.accountCreated || 0) - new Date(b.accountCreated || 0);
        }
        if (filterOptions.sortBy === 'Most Active') {
          return (b.studentTxns?.length || 0) - (a.studentTxns?.length || 0);
        }
        return 0;
      });
  }, [processedStudents, searchQuery, filterOptions]);

  // Select Student for Profile Drawer View
  const selectStudentForProfile = useCallback((student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    students: processedStudents,
    filteredStudents,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    stats,
    selectedStudent,
    setSelectedStudent,
    drawerOpen,
    setDrawerOpen,
    selectStudentForProfile,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};
