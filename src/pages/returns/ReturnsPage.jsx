import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import TransactionStatistics from '../../components/transactions/TransactionStatistics';
import TransactionTable from '../../components/transactions/TransactionTable';
import IssueDialog from '../../components/transactions/IssueDialog';
import ReturnDialog from '../../components/transactions/ReturnDialog';
import TransactionDrawer from '../../components/transactions/TransactionDrawer';
import TransactionFilters from '../../components/transactions/TransactionFilters';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const ReturnsPage = () => {
  const { user } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    issueDialogOpen,
    setIssueDialogOpen,
    returnDialogOpen,
    setReturnDialogOpen,
    targetTransaction,
    selectedTransaction,
    drawerOpen,
    setDrawerOpen,
    openIssueModal,
    openReturnModal,
    issueBook,
    returnBook,
  } = useTransactions();

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Newest' && v !== false
  ).length;

  const handleConfirmIssue = async (issuePayload) => {
    const adminName = user?.displayName || user?.email || 'Lead Librarian Admin';
    await issueBook(issuePayload, adminName);
  };

  const handleConfirmReturn = async (transactionId, condition, notes) => {
    const adminName = user?.displayName || user?.email || 'Lead Librarian Admin';
    await returnBook(transactionId, condition, notes, adminName);
  };

  return (
    <PageContainer
      title="Issue & Returns"
      subtitle="Manage physical checkouts, process book returns, inspect copy conditions, and monitor overdue deadlines."
      actions={
        <CustomButton variant="contained" startIcon={<AddIcon />} onClick={openIssueModal}>
          + Issue Book
        </CustomButton>
      }
    >
      {/* 1. Metric Cards */}
      <TransactionStatistics />

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
        {/* Instant Search Bar */}
        <TextField
          placeholder="Search by Student Name, Register No, Book Title, Copy ID, or Transaction ID..."
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

        {/* Filter Controls */}
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

      {/* 3. Transaction Data Table */}
      <TransactionTable />

      {/* --- MODALS & DRAWERS --- */}

      {/* Issue Book Checkout Modal */}
      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        onConfirm={handleConfirmIssue}
      />

      {/* Mark Returned Modal */}
      <ReturnDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        transaction={targetTransaction}
        onConfirm={handleConfirmReturn}
      />

      {/* Transaction Details Slide-Over Drawer */}
      <TransactionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transaction={selectedTransaction}
        onReturn={openReturnModal}
      />

      {/* Filter Bottom Sheet / Right Drawer */}
      <TransactionFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default ReturnsPage;
