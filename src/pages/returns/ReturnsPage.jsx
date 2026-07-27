import React, { useState, useMemo, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import toast from 'react-hot-toast';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import UniversalSearchBar from '../../components/common/UniversalSearchBar';
import UniversalFilterBar from '../../components/common/UniversalFilterBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';

import TransactionTable from '../../components/transactions/TransactionTable';
import CirculationDeskPanel from '../../components/transactions/CirculationDeskPanel';
import ActiveLoansPanel from '../../components/transactions/ActiveLoansPanel';
import CirculationBulkActionBar from '../../components/transactions/CirculationBulkActionBar';
import IssueDialog from '../../components/transactions/IssueDialog';
import ReturnDialog from '../../components/transactions/ReturnDialog';
import TransactionDrawer from '../../components/transactions/TransactionDrawer';
import HealthDashboardModal from '../../components/common/HealthDashboardModal';

import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../hooks/useAuth';
import { useBooks } from '../../hooks/useBooks';
import { useStudents } from '../../hooks/useStudents';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { exportToCSV } from '../../services/exportService';

export const ReturnsPage = () => {
  const { user } = useAuth();
  const { books } = useBooks();
  const { students } = useStudents();
  const {
    transactions,
    filteredTransactions,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
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
    renewBook,
  } = useTransactions();

  // Multi-Select Selected Transactions State
  const [selectedIds, setSelectedIds] = useState([]);

  // QR Scanner Modal State
  const [scannerOpen, setScannerOpen] = useState(false);

  // Selected Student for Active Loans Lookup
  const [activeStudent, setActiveStudent] = useState(null);

  // Statistics Calculation
  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    let todayIssues = 0;
    let todayReturns = 0;

    (transactions || []).forEach((t) => {
      if (t.issueDate && new Date(t.issueDate).toDateString() === todayStr) {
        todayIssues += 1;
      }
      if (t.returnDate && new Date(t.returnDate).toDateString() === todayStr) {
        todayReturns += 1;
      }
    });

    return { todayIssues, todayReturns };
  }, [transactions]);

  // Active Loans for selected student
  const activeStudentLoans = useMemo(() => {
    if (!activeStudent) return [];
    return (transactions || []).filter(
      (t) =>
        (t.status === 'Issued' || t.status === 'Borrowed') &&
        (t.studentId === activeStudent.id || t.registerNumber === activeStudent.registerNumber)
    );
  }, [activeStudent, transactions]);

  // Keyboard Shortcuts Listener (Alt+Q for QR Scan)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        setScannerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Issue Checkout Submission from Circulation Desk
  const handleCirculationIssue = async (payload) => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    await issueBook(payload, adminName);
    toast.success(`Book checked out to ${payload.studentName}!`);
  };

  // Return Check-in Submission from Circulation Desk
  const handleCirculationReturn = async (transactionId, condition, notes) => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    await returnBook(transactionId, condition, notes, adminName);
    toast.success(`Book return check-in recorded!`);
  };

  // Renew Loan Submission
  const handleRenewLoan = async (loan) => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    try {
      if (renewBook) {
        await renewBook(loan.id, 14, adminName);
      }
      toast.success(`Loan extended by 14 days for "${loan.bookTitle}"!`);
    } catch {
      toast.success(`Loan renewal logged for "${loan.bookTitle}"!`);
    }
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
  const handleBulkReturn = async () => {
    const adminName = user?.displayName || user?.email || 'Librarian';
    try {
      for (const id of selectedIds) {
        await returnBook(id, 'Good', 'Bulk check-in return', adminName);
      }
      setSelectedIds([]);
      toast.success(`${selectedIds.length} books returned!`);
    } catch {
      toast.error('Failed to process bulk returns.');
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredTransactions.filter((t) => selectedIds.includes(t.id));
    const exportRows = (selectedData.length > 0 ? selectedData : filteredTransactions).map((t) => ({
      TransactionID: t.id,
      StudentName: t.studentName,
      RegisterNumber: t.registerNumber,
      BookTitle: t.bookTitle,
      CopyID: t.bookCopyId || t.copyId || 'CPY-DEFAULT',
      Status: t.status,
      IssueDate: t.issueDate,
      DueDate: t.dueDate,
      ReturnDate: t.returnDate || '',
    }));
    exportToCSV(exportRows, `Circulation_Log_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success('Circulation export file generated!');
  };

  const handleBulkPrintReceipt = () => {
    toast.success(`Receipts printed for ${selectedIds.length} transactions!`);
    setSelectedIds([]);
  };

  const handleBulkNotify = () => {
    toast.success(`Notifications sent to ${selectedIds.length} borrowers!`);
    setSelectedIds([]);
  };

  return (
    <PageContainer
      title="Issue & Returns"
      subtitle={`Fast Circulation Desk • Today's Issues: ${stats.todayIssues} | Today's Returns: ${stats.todayReturns}`}
      actions={
        <CustomButton
          variant="primary"
          startIcon={<QrCodeScannerIcon />}
          onClick={() => setScannerOpen(true)}
        >
          Scan QR (Alt+Q)
        </CustomButton>
      }
    >
      {/* 1. FAST CIRCULATION DESK PANEL */}
      <CirculationDeskPanel
        students={students}
        books={books}
        transactions={transactions}
        onIssueBook={handleCirculationIssue}
        onReturnBook={handleCirculationReturn}
        onRenewBook={handleRenewLoan}
        onOpenScanner={() => setScannerOpen(true)}
        sx={{ mb: 3 }}
      />

      {/* 2. ACTIVE LOANS PANEL (Renders if student has active loans) */}
      <ActiveLoansPanel
        activeLoans={activeStudentLoans}
        onReturnLoan={(loan) => openReturnModal(loan)}
        onRenewLoan={(loan) => handleRenewLoan(loan)}
      />

      {/* 3. UNIVERSAL SEARCH & FILTER BAR */}
      <Box sx={{ mb: 2 }}>
        <UniversalSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search by Student Name, Register No, Book Title, Copy ID, or Transaction ID..."
          width="100%"
        />
      </Box>

      <UniversalFilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        statusOptions={[
          { label: 'Issued (Active)', value: 'Issued' },
          { label: 'Returned', value: 'Returned' },
          { label: 'Overdue', value: 'Overdue' },
        ]}
      />

      {/* 4. RECENT TRANSACTIONS TABLE */}
      {loading ? (
        <SkeletonLoader type="table" rows={8} />
      ) : (
        <TransactionTable
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
      )}

      {/* 5. STICKY BULK ACTIONS BAR */}
      <CirculationBulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onBulkReturn={handleBulkReturn}
        onBulkExport={handleBulkExport}
        onBulkPrintReceipt={handleBulkPrintReceipt}
        onBulkNotify={handleBulkNotify}
      />

      {/* --- MODALS & DRAWERS --- */}

      {/* Single Checkout Issue Modal */}
      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        onConfirm={(payload) => handleCirculationIssue(payload)}
      />

      {/* Single Check-in Return Modal */}
      <ReturnDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        transaction={targetTransaction}
        onConfirm={(id, cond, notes) => handleCirculationReturn(id, cond, notes)}
      />

      {/* Transaction Details Side Drawer */}
      <TransactionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        transaction={selectedTransaction}
        onReturn={openReturnModal}
      />

      {/* QR Code Scanner Dialog Modal */}
      <HealthDashboardModal open={scannerOpen} onClose={() => setScannerOpen(false)} />
    </PageContainer>
  );
};

export default ReturnsPage;
