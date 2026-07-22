import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import BorrowRequestStatistics from '../../components/requests/BorrowRequestStatistics';
import BorrowRequestTable from '../../components/requests/BorrowRequestTable';
import BorrowApprovalDialog from '../../components/requests/BorrowApprovalDialog';
import BorrowRejectDialog from '../../components/requests/BorrowRejectDialog';
import BorrowRequestDrawer from '../../components/requests/BorrowRequestDrawer';
import BorrowRequestFilters from '../../components/requests/BorrowRequestFilters';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';
import { useAuth } from '../../hooks/useAuth';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const RequestsPage = () => {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    approvalDialogOpen,
    setApprovalDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    targetRequest,
    selectedRequest,
    drawerOpen,
    setDrawerOpen,
    openApprovalModal,
    openRejectModal,
    approveRequest,
    rejectRequest,
  } = useBorrowRequests();

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Newest'
  ).length;

  const handleConfirmApproval = async (requestId, durationDays) => {
    const adminName = user?.displayName || user?.email || 'Lead Librarian Admin';
    await approveRequest(requestId, durationDays, adminName);
  };

  const handleConfirmRejection = async (requestId, reason) => {
    const adminName = user?.displayName || user?.email || 'Lead Librarian Admin';
    await rejectRequest(requestId, reason, adminName);
  };

  return (
    <PageContainer
      title="Borrow Requests"
      subtitle="Manage all student borrowing requests originating from the Borrow mobile app in real time."
    >
      {/* 1. Statistics Cards */}
      <BorrowRequestStatistics />

      {/* 2. Search & Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
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
        {/* Instant Search Input */}
        <TextField
          placeholder="Search by Student Name, Register No, Book Title, ISBN, or Request ID..."
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

        {/* Action Controls */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <CustomButton
            variant="outlined"
            startIcon={
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterListIcon />
              </Badge>
            }
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ borderColor: BORROW_COLORS.border }}
          >
            Filters
          </CustomButton>

          {(searchQuery || activeFilterCount > 0) && (
            <CustomButton variant="text" startIcon={<RestartAltIcon />} onClick={resetFilters}>
              Clear Search
            </CustomButton>
          )}
        </Box>
      </Box>

      {/* 3. Requests Data Table */}
      <BorrowRequestTable />

      {/* --- MODALS & DRAWERS --- */}

      {/* Approve Modal */}
      <BorrowApprovalDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        request={targetRequest}
        onConfirm={handleConfirmApproval}
      />

      {/* Reject Modal */}
      <BorrowRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        request={targetRequest}
        onConfirm={handleConfirmRejection}
      />

      {/* Request Details Slide-Over Drawer */}
      <BorrowRequestDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        request={selectedRequest}
        onApprove={openApprovalModal}
        onReject={openRejectModal}
      />

      {/* Filter Bottom Sheet / Drawer */}
      <BorrowRequestFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default RequestsPage;
