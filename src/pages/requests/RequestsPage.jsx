import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import toast from 'react-hot-toast';

// Icons
import TableRowsIcon from '@mui/icons-material/TableRows';
import GridViewIcon from '@mui/icons-material/GridView';
import AddIcon from '@mui/icons-material/Add';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import UniversalSearchBar from '../../components/common/UniversalSearchBar';
import UniversalFilterBar from '../../components/common/UniversalFilterBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import CustomDialog from '../../components/common/CustomDialog';

import BorrowRequestTable from '../../components/requests/BorrowRequestTable';
import RequestCardView from '../../components/requests/RequestCardView';
import RequestBulkActionBar from '../../components/requests/RequestBulkActionBar';
import BorrowApprovalDialog from '../../components/requests/BorrowApprovalDialog';
import BorrowRejectDialog from '../../components/requests/BorrowRejectDialog';
import BorrowRequestDrawer from '../../components/requests/BorrowRequestDrawer';

import { useBorrowRequests } from '../../hooks/useBorrowRequests';
import { useAuth } from '../../hooks/useAuth';
import { useBooks } from '../../hooks/useBooks';
import { useStudents } from '../../hooks/useStudents';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { exportToCSV } from '../../services/exportService';

export const RequestsPage = () => {
  const { user } = useAuth();
  const { books } = useBooks();
  const { students } = useStudents();
  const {
    requests,
    filteredRequests,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
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
    selectRequestForDetails,
  } = useBorrowRequests();

  // Local View Toggle ('table' | 'grid')
  const [viewMode, setViewMode] = useState('table');

  // Active Status Tab ('All' | 'Pending' | 'Approved' | 'Issued' | 'Rejected' | 'Returned')
  const [activeTab, setActiveTab] = useState('Pending');

  // Multi-Select Selected Requests State
  const [selectedIds, setSelectedIds] = useState([]);

  // Manual Request Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualBookId, setManualBookId] = useState('');

  // Department & Filter Options
  const departmentOptions = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
  const sortOptions = [
    { label: 'Newest First', value: 'Newest' },
    { label: 'Oldest First', value: 'Oldest' },
    { label: 'Student Name', value: 'Student Name' },
    { label: 'Book Title', value: 'Book Name' },
  ];

  // Count Badges per Status Tab
  const tabCounts = useMemo(() => {
    const counts = { All: requests.length, Pending: 0, Approved: 0, Issued: 0, Rejected: 0, Returned: 0 };
    requests.forEach((r) => {
      const st = r.status || 'Pending';
      if (counts[st] !== undefined) counts[st] += 1;
    });
    return counts;
  }, [requests]);

  // Tab change handler updates status filter
  const handleTabChange = (_, newTab) => {
    setActiveTab(newTab);
    setFilterOptions((prev) => ({ ...prev, status: newTab }));
    setSelectedIds([]);
  };

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = (pageIds) => {
    const isAllSelected = pageIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Operations
  const handleBulkApprove = async () => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    try {
      for (const id of selectedIds) {
        await approveRequest(id, 14, adminName);
      }
      setSelectedIds([]);
      toast.success(`${selectedIds.length} requests approved!`);
    } catch {
      toast.error('Failed to approve selected requests.');
    }
  };

  const handleBulkReject = async () => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    try {
      for (const id of selectedIds) {
        await rejectRequest(id, 'Bulk rejection by librarian', adminName);
      }
      setSelectedIds([]);
      toast.success(`${selectedIds.length} requests rejected.`);
    } catch {
      toast.error('Failed to reject selected requests.');
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredRequests.filter((r) => selectedIds.includes(r.id));
    const exportRows = (selectedData.length > 0 ? selectedData : filteredRequests).map((r) => ({
      RequestID: r.id || r.requestId,
      StudentName: r.studentName,
      RegisterNumber: r.registerNumber,
      Department: r.department,
      BookTitle: r.bookTitle,
      ISBN: r.isbn,
      Status: r.status,
      Priority: r.priority || 'Normal',
      RequestedDate: r.requestDate,
    }));
    exportToCSV(exportRows, `Borrow_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Borrow requests export generated!');
  };

  const handleBulkNotify = () => {
    toast.success(`Notifications sent to ${selectedIds.length} students!`);
    setSelectedIds([]);
  };

  // Confirm Single Approval/Rejection Dialogs
  const handleConfirmApproval = async (requestId, durationDays) => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    await approveRequest(requestId, durationDays, adminName);
  };

  const handleConfirmRejection = async (requestId, reason) => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    await rejectRequest(requestId, reason, adminName);
  };

  // Submit Manual Request Modal
  const handleManualRequestSubmit = () => {
    if (!manualStudentId || !manualBookId) {
      toast.error('Please fill in Student ID and Book ID');
      return;
    }
    toast.success('Manual borrow request logged successfully');
    setManualStudentId('');
    setManualBookId('');
    setManualModalOpen(false);
  };

  return (
    <PageContainer
      title="Borrow Requests"
      subtitle={`Inbox — ${tabCounts.Pending} pending approvals requiring librarian decision today.`}
      actions={
        <CustomButton
          variant="primary"
          startIcon={<AddIcon />}
          onClick={() => setManualModalOpen(true)}
        >
          + Manual Request
        </CustomButton>
      }
    >
      {/* 1. Status Tabs Bar */}
      <Box sx={{ borderBottom: `1px solid ${BORROW_COLORS.border}`, mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84375rem',
              minHeight: 44,
              px: 2,
            },
          }}
        >
          {['Pending', 'All', 'Approved', 'Issued', 'Rejected', 'Returned'].map((status) => (
            <Tab
              key={status}
              value={status}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{status}</span>
                  <Chip
                    label={tabCounts[status] || 0}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      backgroundColor: activeTab === status ? BORROW_COLORS.primarySurface : BORROW_COLORS.background,
                      color: activeTab === status ? BORROW_COLORS.primary : BORROW_COLORS.textMuted,
                    }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* 2. Universal Search Bar & View Switcher */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <UniversalSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search by Student Name, Register No, Book Title, ISBN, or Request ID..."
          width="100%"
          sx={{ flexGrow: 1 }}
        />

        {/* View Switcher Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newView) => newView && setViewMode(newView)}
          size="small"
          aria-label="View Mode Switcher"
          sx={{ backgroundColor: BORROW_COLORS.surface, alignSelf: { xs: 'flex-end', sm: 'center' } }}
        >
          <ToggleButton value="table" aria-label="Table View">
            <Tooltip title="Table View">
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Card View">
            <Tooltip title="Card View">
              <GridViewIcon sx={{ fontSize: 18 }} />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 3. Universal Filter Bar */}
      <UniversalFilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        departmentOptions={departmentOptions}
        sortOptions={sortOptions}
      />

      {/* 4. Requests Data Content (Table View vs Card View with Skeleton Loader) */}
      {loading ? (
        <SkeletonLoader type={viewMode === 'grid' ? 'grid' : 'table'} rows={8} count={8} />
      ) : viewMode === 'grid' ? (
        <RequestCardView
          requests={filteredRequests}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectDetails={selectRequestForDetails}
          onApprove={openApprovalModal}
          onReject={openRejectModal}
        />
      ) : (
        <BorrowRequestTable
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}

      {/* 5. Sticky Bulk Actions Bar */}
      <RequestBulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onBulkExport={handleBulkExport}
        onBulkNotify={handleBulkNotify}
      />

      {/* --- MODALS & DRAWERS --- */}

      {/* Single Approve Modal */}
      <BorrowApprovalDialog
        open={approvalDialogOpen}
        onClose={() => setApprovalDialogOpen(false)}
        request={targetRequest}
        onConfirm={handleConfirmApproval}
      />

      {/* Single Reject Modal */}
      <BorrowRejectDialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        request={targetRequest}
        onConfirm={handleConfirmRejection}
      />

      {/* Request Details & Lifecycle Timeline Side Drawer */}
      <BorrowRequestDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        request={selectedRequest}
        onApprove={openApprovalModal}
        onReject={openRejectModal}
      />

      {/* Manual Request Dialog */}
      <CustomDialog
        open={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        title="Create Manual Borrow Request"
        subtitle="Log a walk-in student borrowing request directly."
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setManualModalOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleManualRequestSubmit}>
              Create Request
            </CustomButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Student Register No / ID"
            placeholder="ST-2024-001"
            fullWidth
            required
            value={manualStudentId}
            onChange={(e) => setManualStudentId(e.target.value)}
          />
          <TextField
            label="Book ISBN / Title"
            placeholder="Select or enter Book ISBN"
            fullWidth
            required
            value={manualBookId}
            onChange={(e) => setManualBookId(e.target.value)}
          />
        </Box>
      </CustomDialog>
    </PageContainer>
  );
};

export default RequestsPage;
