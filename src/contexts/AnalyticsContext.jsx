import React, { createContext, useState, useMemo, useCallback } from 'react';
import useBooks from '../hooks/useBooks';
import useStudents from '../hooks/useStudents';
import useTransactions from '../hooks/useTransactions';
import useBorrowRequests from '../hooks/useBorrowRequests';
import {
  computeMonthlyTrends,
  computeTopBooks,
  computeTopStudents,
  computeCategoryReport,
  computeDepartmentReport,
} from '../services/firebase/reportService';
import { exportToCSV, exportToPDF } from '../services/exportService';
import toast from 'react-hot-toast';

export const AnalyticsContext = createContext(null);

export const AnalyticsProvider = ({ children }) => {
  const { books } = useBooks();
  const { students } = useStudents();
  const { transactions } = useTransactions();
  const { requests } = useBorrowRequests();

  const [dateRange, setDateRange] = useState('All Time');
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Compute summary metrics
  const summaryStats = useMemo(() => {
    const totalBooks = books.filter((b) => !b.isArchived).length;
    const totalStudents = students.length;
    const booksIssued = transactions.filter((t) => t.issueDate).length;
    const booksReturned = transactions.filter((t) => t.returnDate || t.status === 'Returned').length;
    const currentlyBorrowed = transactions.filter((t) => t.computedStatus === 'Issued' || t.computedStatus === 'Overdue').length;
    const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
    const overdueBooks = transactions.filter((t) => t.isOverdue || t.computedStatus === 'Overdue').length;
    const avgBorrowDuration = 14; // Default standard loan duration

    return {
      totalBooks,
      totalStudents,
      booksIssued,
      booksReturned,
      currentlyBorrowed,
      pendingRequests,
      overdueBooks,
      avgBorrowDuration,
    };
  }, [books, students, transactions, requests]);

  // Compute visual trend charts and reports
  const monthlyTrends = useMemo(() => computeMonthlyTrends(transactions, requests), [transactions, requests]);
  const topBooks = useMemo(() => computeTopBooks(books, transactions), [books, transactions]);
  const topStudents = useMemo(() => computeTopStudents(students, transactions), [students, transactions]);
  const categoryReport = useMemo(() => computeCategoryReport(books, transactions), [books, transactions]);
  const departmentReport = useMemo(() => computeDepartmentReport(students, transactions), [students, transactions]);
  const overdueReport = useMemo(() => transactions.filter((t) => t.isOverdue || t.computedStatus === 'Overdue'), [transactions]);

  // Export Trigger Action
  const handleExportReport = useCallback((reportType, formatType) => {
    let filename = `Borrow_Library_${reportType.replace(/\s+/g, '_')}`;
    let headers = [];
    let dataRows = [];

    if (reportType === 'Top Books') {
      headers = [
        { key: 'title', label: 'Book Title' },
        { key: 'author', label: 'Author' },
        { key: 'category', label: 'Category' },
        { key: 'isbn', label: 'ISBN' },
        { key: 'borrowCount', label: 'Times Borrowed' },
        { key: 'availableCopies', label: 'Available Copies' },
      ];
      dataRows = topBooks;
    } else if (reportType === 'Top Students') {
      headers = [
        { key: 'name', label: 'Student Name' },
        { key: 'regNo', label: 'Register Number' },
        { key: 'department', label: 'Department' },
        { key: 'totalBorrowed', label: 'Total Books Borrowed' },
        { key: 'activeLoans', label: 'Current Active Loans' },
      ];
      dataRows = topStudents;
    } else if (reportType === 'Overdue Books') {
      headers = [
        { key: 'studentName', label: 'Student Name' },
        { key: 'registerNumber', label: 'Register No' },
        { key: 'bookTitle', label: 'Book Title' },
        { key: 'bookCopyId', label: 'Copy ID' },
        { key: 'dueDate', label: 'Due Date' },
        { key: 'daysOverdue', label: 'Days Overdue' },
      ];
      dataRows = overdueReport;
    } else if (reportType === 'Category Usage') {
      headers = [
        { key: 'category', label: 'Category' },
        { key: 'totalTitles', label: 'Total Titles' },
        { key: 'borrowedCopies', label: 'Borrowed Copies' },
        { key: 'popularityPercentage', label: 'Popularity %' },
      ];
      dataRows = categoryReport;
    } else if (reportType === 'Department Usage') {
      headers = [
        { key: 'department', label: 'Department' },
        { key: 'studentCount', label: 'Registered Students' },
        { key: 'booksBorrowed', label: 'Books Borrowed' },
      ];
      dataRows = departmentReport;
    }

    if (formatType === 'CSV') {
      exportToCSV(filename, headers, dataRows);
      toast.success(`Exported ${reportType} report to CSV!`);
    } else if (formatType === 'PDF') {
      exportToPDF(`${reportType} Report`, headers, dataRows);
      toast.success(`Generated ${reportType} PDF report!`);
    }

    setExportModalOpen(false);
  }, [topBooks, topStudents, overdueReport, categoryReport, departmentReport]);

  const value = {
    dateRange,
    setDateRange,
    summaryStats,
    monthlyTrends,
    topBooks,
    topStudents,
    categoryReport,
    departmentReport,
    overdueReport,
    exportModalOpen,
    setExportModalOpen,
    exportReport: handleExportReport,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};
