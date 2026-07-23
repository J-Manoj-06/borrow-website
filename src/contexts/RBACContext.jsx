import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  subscribeToAdmins,
  createAdminProfile,
  updateAdminRecord,
  deleteAdminRecord,
} from '../services/firebase/adminService';
import {
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
} from '../models/rbacModel';
import useAuth from '../hooks/useAuth';
import useActivity from '../hooks/useActivity';
import { ACTIVITY_TYPES, MODULE_TYPES } from '../models/activityModel';

export const RBACContext = createContext(null);

const defaultFilters = {
  role: 'All',
  department: 'All',
  status: 'All',
  sortBy: 'Alphabetical',
};

export const RBACProvider = ({ children }) => {
  const { user, adminProfile, role: authRole } = useAuth();
  const { logActivity } = useActivity();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptions, setFilterOptions] = useState(defaultFilters);

  // Dialog & Drawer toggles
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [matrixDrawerOpen, setMatrixDrawerOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Subscribe to real-time admins snapshot from Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAdmins((data) => {
      setAdmins(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Determine active user's current system role dynamically
  const currentUserRole = useMemo(() => {
    if (adminProfile?.role) return adminProfile.role;
    if (authRole) return authRole;
    if (!user) return SYSTEM_ROLES.LIBRARIAN;
    const match = admins.find((a) => a.email?.toLowerCase() === user.email?.toLowerCase());
    return match ? match.role : SYSTEM_ROLES.SUPER_ADMIN;
  }, [user, adminProfile, authRole, admins]);

  // Dynamic RBAC Permission Checker reading Firestore permissions or Role Defaults
  const hasPermission = useCallback(
    (moduleName, actionType) => {
      // 1. Check custom assigned permissions on active admin profile doc if available
      if (adminProfile?.permissions && adminProfile.permissions[moduleName]) {
        const customActions = adminProfile.permissions[moduleName];
        if (Array.isArray(customActions)) {
          return customActions.includes(actionType);
        }
      }

      // 2. Fallback to built-in role default matrix
      const rolePerms = DEFAULT_ROLE_PERMISSIONS[currentUserRole];
      if (!rolePerms) return false;
      const actions = rolePerms[moduleName];
      if (!actions) return false;
      return actions.includes(actionType);
    },
    [adminProfile, currentUserRole]
  );

  // Role Checker
  const hasRole = useCallback(
    (roleName) => {
      return currentUserRole === roleName;
    },
    [currentUserRole]
  );

  // Stats Metrics
  const stats = useMemo(() => {
    let totalAdmins = 0;
    let superAdminsCount = 0;
    let libraryAdminsCount = 0;
    let librariansCount = 0;
    let activeAccountsCount = 0;

    admins.forEach((a) => {
      totalAdmins += 1;
      if (a.role === SYSTEM_ROLES.SUPER_ADMIN) superAdminsCount += 1;
      if (a.role === SYSTEM_ROLES.LIBRARY_ADMIN) libraryAdminsCount += 1;
      if (a.role === SYSTEM_ROLES.LIBRARIAN) librariansCount += 1;
      if (a.status === 'Active') activeAccountsCount += 1;
    });

    return {
      totalAdmins,
      superAdminsCount,
      libraryAdminsCount,
      librariansCount,
      activeAccountsCount,
    };
  }, [admins]);

  // Filtered Admins List
  const filteredAdmins = useMemo(() => {
    return admins
      .filter((a) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = a.fullName?.toLowerCase().includes(q);
          const matchesEmp = a.employeeId?.toLowerCase().includes(q);
          const matchesEmail = a.email?.toLowerCase().includes(q);
          const matchesDept = a.department?.toLowerCase().includes(q);

          if (!matchesName && !matchesEmp && !matchesEmail && !matchesDept) {
            return false;
          }
        }

        // Filters
        if (filterOptions.role !== 'All' && a.role !== filterOptions.role) return false;
        if (filterOptions.department !== 'All' && a.department !== filterOptions.department) return false;
        if (filterOptions.status !== 'All' && a.status !== filterOptions.status) return false;

        return true;
      })
      .sort((a, b) => {
        if (filterOptions.sortBy === 'Alphabetical') {
          return (a.fullName || '').localeCompare(b.fullName || '');
        }
        if (filterOptions.sortBy === 'Newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return 0;
      });
  }, [admins, searchQuery, filterOptions]);

  // Admin Account Actions
  const handleCreateAdmin = useCallback(
    async (payload) => {
      const defaultPerms = DEFAULT_ROLE_PERMISSIONS[payload.role || SYSTEM_ROLES.LIBRARIAN];
      const created = await createAdminProfile({
        ...payload,
        permissions: payload.permissions || defaultPerms,
      });
      toast.success(`Created admin account for ${created.fullName}!`);
      logActivity(
        ACTIVITY_TYPES.ROLE_UPDATED,
        MODULE_TYPES.ADMINS,
        `Created Admin ${created.fullName} (${created.role})`,
        created.id,
        null,
        created
      ).catch(console.warn);
      setAdminDialogOpen(false);
    },
    [logActivity]
  );

  const handleUpdateAdmin = useCallback(
    async (id, payload) => {
      const target = admins.find((a) => a.id === id);
      await updateAdminRecord(id, payload);
      toast.success(`Updated profile for ${target?.fullName || 'Admin'}`);
      logActivity(
        ACTIVITY_TYPES.ROLE_UPDATED,
        MODULE_TYPES.ADMINS,
        `Updated Admin ${target?.fullName}`,
        id,
        target,
        payload
      ).catch(console.warn);
      setAdminDialogOpen(false);
      setEditingAdmin(null);
    },
    [admins, logActivity]
  );

  const handleDeleteAdmin = useCallback(
    async (id) => {
      const target = admins.find((a) => a.id === id);
      if (target?.role === SYSTEM_ROLES.SUPER_ADMIN && currentUserRole !== SYSTEM_ROLES.SUPER_ADMIN) {
        toast.error('Only Super Admins can remove Super Admin accounts!');
        return;
      }
      await deleteAdminRecord(id);
      toast.success(`Removed admin account.`);
      logActivity(
        ACTIVITY_TYPES.ROLE_UPDATED,
        MODULE_TYPES.ADMINS,
        `Deleted Admin ${target?.fullName}`,
        id,
        target,
        null
      ).catch(console.warn);
    },
    [admins, currentUserRole, logActivity]
  );

  const handleDeactivateAdmin = useCallback(
    async (id) => {
      const target = admins.find((a) => a.id === id);
      if (target?.role === SYSTEM_ROLES.SUPER_ADMIN && currentUserRole !== SYSTEM_ROLES.SUPER_ADMIN) {
        toast.error('Only Super Admins can deactivate Super Admin accounts!');
        return;
      }
      const newStatus = target?.status === 'Active' ? 'Disabled' : 'Active';
      await updateAdminRecord(id, { status: newStatus });
      toast.success(`Account status changed to ${newStatus}.`);
      logActivity(
        ACTIVITY_TYPES.ROLE_UPDATED,
        MODULE_TYPES.ADMINS,
        `Changed status for ${target?.fullName} to ${newStatus}`,
        id,
        target,
        { status: newStatus }
      ).catch(console.warn);
    },
    [admins, currentUserRole, logActivity]
  );

  const selectAdminForProfile = useCallback((admin) => {
    setSelectedAdmin(admin);
    setAdminDrawerOpen(true);
  }, []);

  const openEditAdminDialog = useCallback((admin) => {
    setEditingAdmin(admin);
    setAdminDialogOpen(true);
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions(defaultFilters);
    setSearchQuery('');
  }, []);

  const value = {
    currentUserRole,
    hasPermission,
    hasRole,
    admins: filteredAdmins,
    rawAdmins: admins,
    loading,
    stats,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    adminDialogOpen,
    setAdminDialogOpen,
    adminDrawerOpen,
    setAdminDrawerOpen,
    matrixDrawerOpen,
    setMatrixDrawerOpen,
    selectedAdmin,
    editingAdmin,
    selectAdminForProfile,
    openEditAdminDialog,
    createAdmin: handleCreateAdmin,
    updateAdmin: handleUpdateAdmin,
    deleteAdmin: handleDeleteAdmin,
    deactivateAdmin: handleDeactivateAdmin,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export default RBACProvider;
