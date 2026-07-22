import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import AdminStatistics from '../../components/admin/AdminStatistics';
import AdminTable from '../../components/admin/AdminTable';
import AdminDialog from '../../components/admin/AdminDialog';
import AdminProfileDrawer from '../../components/admin/AdminProfileDrawer';
import PermissionMatrix from '../../components/admin/PermissionMatrix';
import { useRBAC } from '../../hooks/useRBAC';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { PERMISSION_MODULES, PERMISSION_ACTIONS, SYSTEM_ROLES } from '../../models/rbacModel';
import ProtectedPermission from '../../components/rbac/ProtectedPermission';

export const AdminManagementPage = () => {
  const {
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
    openEditAdminDialog,
  } = useRBAC();

  const activeFilterCount = Object.values(filterOptions).filter((v) => v !== 'All' && v !== 'Alphabetical').length;

  return (
    <PageContainer
      title="Admin Management & System RBAC"
      subtitle="Manage administrator & librarian accounts, role assignments, department scopes, and system permissions."
      actions={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <CustomButton
            variant="outlined"
            startIcon={<VerifiedUserIcon />}
            onClick={() => setMatrixDrawerOpen(true)}
          >
            Permission Matrix
          </CustomButton>

          <ProtectedPermission module={PERMISSION_MODULES.ADMINS} action={PERMISSION_ACTIONS.CREATE}>
            <CustomButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openEditAdminDialog(null)}
            >
              Add Administrator
            </CustomButton>
          </ProtectedPermission>
        </Box>
      }
    >
      {/* 1. Statistics Cards */}
      <AdminStatistics />

      {/* 2. Search & Filters Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          backgroundColor: BORROW_COLORS.surface,
          p: 2,
          borderRadius: '16px',
          border: `1px solid ${BORROW_COLORS.border}`,
          boxShadow: BORROW_COLORS.cardShadow,
        }}
      >
        {/* Search Bar */}
        <TextField
          placeholder="Search by Admin Name, Employee ID, Email, or Department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: BORROW_COLORS.primary }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Dropdowns */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            select
            size="small"
            value={filterOptions.role}
            onChange={(e) => setFilterOptions((prev) => ({ ...prev, role: e.target.value }))}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value={SYSTEM_ROLES.SUPER_ADMIN}>Super Admin</MenuItem>
            <MenuItem value={SYSTEM_ROLES.LIBRARY_ADMIN}>Library Admin</MenuItem>
            <MenuItem value={SYSTEM_ROLES.LIBRARIAN}>Librarian</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={filterOptions.status}
            onChange={(e) => setFilterOptions((prev) => ({ ...prev, status: e.target.value }))}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Disabled">Disabled</MenuItem>
            <MenuItem value="Suspended">Suspended</MenuItem>
          </TextField>

          {(searchQuery || activeFilterCount > 0) && (
            <CustomButton variant="text" startIcon={<RestartAltIcon />} onClick={resetFilters}>
              Reset
            </CustomButton>
          )}
        </Box>
      </Box>

      {/* 3. Admin Data Table */}
      <AdminTable />

      {/* --- DRAWERS & MODALS --- */}
      <AdminDialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} />
      <AdminProfileDrawer open={adminDrawerOpen} onClose={() => setAdminDrawerOpen(false)} admin={selectedAdmin} />
      <PermissionMatrix open={matrixDrawerOpen} onClose={() => setMatrixDrawerOpen(false)} />
    </PageContainer>
  );
};

export default AdminManagementPage;
