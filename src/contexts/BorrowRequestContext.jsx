import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeToBorrowRequests,
  approveBorrowRequestTransaction,
  rejectBorrowRequestTransaction,
  checkAndExpireReservations,
} from '../services/firebase/borrowRequestService';
import { REQUEST_STATUSES } from '../models/borrowRequestModel';

export const BorrowRequestContext = createContext(null);

const defaultFilters = {
  status: 'All',
  department: 'All',
  year: 'All',
  category: 'All',
  sortBy: 'Newest',
};

export const BorrowRequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [targetRequest, setTargetRequest] = useState(null);

  // Subscribe to real-time Firestore updates on mount and check reservation expirations
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToBorrowRequests((data) => {
      setRequests(data);
      setLoading(false);
    });

    // Check reservation expiration on mount
    checkAndExpireReservations().catch(console.warn);

    return () => unsubscribe();
  }, []);

  // Compute live statistics metrics
  const stats = useMemo(() => {
    let pendingRequests = 0;
    let approvedToday = 0;
    let rejectedToday = 0;
    let activeBorrows = 0;
    let completedRequests = 0;

    const todayStr = new Date().toDateString();

    requests.forEach((r) => {
      if (r.status === REQUEST_STATUSES.PENDING) {
        pendingRequests += 1;
      } else if (r.status === REQUEST_STATUSES.APPROVED || r.status === REQUEST_STATUSES.ISSUED) {
        activeBorrows += 1;
        if (r.approvedDate && new Date(r.approvedDate).toDateString() === todayStr) {
          approvedToday += 1;
        }
      } else if (r.status === REQUEST_STATUSES.REJECTED) {
        if (r.rejectedDate && new Date(r.rejectedDate).toDateString() === todayStr) {
          rejectedToday += 1;
        }
      } else if (r.status === REQUEST_STATUSES.RETURNED || r.status === 'Completed') {
        completedRequests += 1;
      }
    });

    return {
      pendingRequests,
      approvedToday,
      rejectedToday,
      activeBorrows,
      completedRequests,
    };
  }, [requests]);

  // Filter & Search Computation
  const filteredRequests = useMemo(() => {
    return requests
      .filter((r) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesStudent = r.studentName?.toLowerCase().includes(q);
          const matchesReg = r.registerNumber?.toLowerCase().includes(q);
          const matchesTitle = r.bookTitle?.toLowerCase().includes(q);
          const matchesIsbn = r.isbn?.toLowerCase().includes(q);
          const matchesReqId = (r.requestId || r.id)?.toLowerCase().includes(q);

          if (!matchesStudent && !matchesReg && !matchesTitle && !matchesIsbn && !matchesReqId) {
            return false;
          }
        }

        // Status Filter
        if (filterOptions.status !== 'All' && r.status !== filterOptions.status) {
          return false;
        }

        // Department Filter
        if (filterOptions.department !== 'All' && r.department !== filterOptions.department) {
          return false;
        }

        // Year Filter
        if (filterOptions.year !== 'All' && r.year !== filterOptions.year) {
          return false;
        }

        // Category Filter
        if (filterOptions.category !== 'All' && r.category !== filterOptions.category) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b.requestDate) - new Date(a.requestDate);
        }
        if (filterOptions.sortBy === 'Oldest') {
          return new Date(a.requestDate) - new Date(b.requestDate);
        }
        if (filterOptions.sortBy === 'Student Name') {
          return (a.studentName || '').localeCompare(b.studentName || '');
        }
        if (filterOptions.sortBy === 'Book Name') {
          return (a.bookTitle || '').localeCompare(b.bookTitle || '');
        }
        return 0;
      });
  }, [requests, searchQuery, filterOptions]);

  // Open Approval Dialog
  const openApprovalModal = useCallback((request) => {
    setTargetRequest(request);
    setApprovalDialogOpen(true);
  }, []);

  // Open Reject Dialog
  const openRejectModal = useCallback((request) => {
    setTargetRequest(request);
    setRejectDialogOpen(true);
  }, []);

  // Open Request Details Drawer
  const selectRequestForDetails = useCallback((request) => {
    setSelectedRequest(request);
    setDrawerOpen(true);
  }, []);

  // Handle Approve Action (Atomic Firestore Transaction & Copy Reservation)
  const handleApprove = useCallback(async (requestId, durationDays, adminName) => {
    try {
      const res = await approveBorrowRequestTransaction(requestId, durationDays, adminName);
      toast.success(`Request ${requestId} approved! Reserved copy: ${res.reservedCopyId}`);
      setApprovalDialogOpen(false);
      setTargetRequest(null);
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to approve borrow request');
      throw err;
    }
  }, []);

  // Handle Reject Action (Atomic Firestore Transaction & Structured Reason)
  const handleReject = useCallback(async (requestId, reason, adminName) => {
    try {
      await rejectBorrowRequestTransaction(requestId, reason, adminName);
      toast.error(`Request ${requestId} rejected.`);
      setRejectDialogOpen(false);
      setTargetRequest(null);
    } catch (err) {
      toast.error(err.message || 'Failed to reject borrow request');
      throw err;
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    requests,
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    stats,
    selectedRequest,
    setSelectedRequest,
    drawerOpen,
    setDrawerOpen,
    approvalDialogOpen,
    setApprovalDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    targetRequest,
    openApprovalModal,
    openRejectModal,
    selectRequestForDetails,
    approveRequest: handleApprove,
    rejectRequest: handleReject,
  };

  return <BorrowRequestContext.Provider value={value}>{children}</BorrowRequestContext.Provider>;
};

export default BorrowRequestProvider;
