import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  subscribeToActivityLogs,
  logActivityRecord,
} from '../services/firebase/activityService';
import { ACTIVITY_TYPES } from '../models/activityModel';
import useAuth from '../hooks/useAuth';

export const ActivityContext = createContext(null);

const defaultFilters = {
  activityType: 'All',
  module: 'All',
  performedBy: 'All',
  status: 'All',
  sortBy: 'Newest',
};

export const ActivityProvider = ({ children }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'timeline'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Subscribe to real-time activity log updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToActivityLogs((data) => {
      setActivities(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Compute stats metrics
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    let activitiesToday = 0;
    let booksAddedCount = 0;
    let booksIssuedCount = 0;
    let booksReturnedCount = 0;
    let requestsApprovedCount = 0;
    let requestsRejectedCount = 0;
    let adminLoginsCount = 0;

    activities.forEach((act) => {
      if (act.createdAt && new Date(act.createdAt).toDateString() === today) {
        activitiesToday += 1;
      }
      if (act.activityType === ACTIVITY_TYPES.BOOK_ADDED) booksAddedCount += 1;
      if (act.activityType === ACTIVITY_TYPES.BOOK_ISSUED) booksIssuedCount += 1;
      if (act.activityType === ACTIVITY_TYPES.BOOK_RETURNED) booksReturnedCount += 1;
      if (act.activityType === ACTIVITY_TYPES.BORROW_APPROVED) requestsApprovedCount += 1;
      if (act.activityType === ACTIVITY_TYPES.BORROW_REJECTED) requestsRejectedCount += 1;
      if (act.activityType === ACTIVITY_TYPES.ADMIN_LOGIN) adminLoginsCount += 1;
    });

    return {
      activitiesToday,
      booksAddedCount,
      booksIssuedCount,
      booksReturnedCount,
      requestsApprovedCount,
      requestsRejectedCount,
      adminLoginsCount,
    };
  }, [activities]);

  // Filter & Search Logic
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesType = act.activityType?.toLowerCase().includes(q);
          const matchesModule = act.module?.toLowerCase().includes(q);
          const matchesBy = act.performedBy?.toLowerCase().includes(q);
          const matchesItem = act.affectedDocumentName?.toLowerCase().includes(q);
          const matchesDocId = act.affectedDocumentId?.toLowerCase().includes(q);

          if (!matchesType && !matchesModule && !matchesBy && !matchesItem && !matchesDocId) {
            return false;
          }
        }

        // Filters
        if (filterOptions.activityType !== 'All' && act.activityType !== filterOptions.activityType) return false;
        if (filterOptions.module !== 'All' && act.module !== filterOptions.module) return false;
        if (filterOptions.performedBy !== 'All' && act.performedBy !== filterOptions.performedBy) return false;
        if (filterOptions.status !== 'All' && act.status !== filterOptions.status) return false;

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (filterOptions.sortBy === 'Oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        return 0;
      });
  }, [activities, searchQuery, filterOptions]);

  // Helper method for automatic telemetry logging
  const logActivity = useCallback(
    async (activityType, module, affectedDocumentName, affectedDocumentId = '', oldData = null, newData = null) => {
      const adminName = user?.displayName || user?.email || 'Lead Librarian Admin';
      const adminEmail = user?.email || 'admin@borrow.com';

      await logActivityRecord({
        activityType,
        module,
        performedBy: adminName,
        adminEmail,
        affectedDocumentName,
        affectedDocumentId,
        oldData,
        newData,
      });
    },
    [user]
  );

  const selectActivityForDetails = useCallback((activity) => {
    setSelectedActivity(activity);
    setDrawerOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    activities: filteredActivities,
    rawActivities: activities,
    loading,
    stats,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    filterDrawerOpen,
    setFilterDrawerOpen,
    selectedActivity,
    drawerOpen,
    setDrawerOpen,
    selectActivityForDetails,
    logActivity,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};
