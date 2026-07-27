import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import toast from 'react-hot-toast';

// Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import PageContainer from '../../components/common/PageContainer';
import DashboardCard from '../../components/common/DashboardCard';
import SectionHeader from '../../components/common/SectionHeader';
import CustomButton from '../../components/common/CustomButton';
import CustomTable, { StatusChip } from '../../components/common/CustomTable';
import CustomDialog from '../../components/common/CustomDialog';
import { ROUTES } from '../../constants/routes';

import useBooks from '../../hooks/useBooks';
import useBorrowRequests from '../../hooks/useBorrowRequests';
import useTransactions from '../../hooks/useTransactions';
import useStudents from '../../hooks/useStudents';
import useNotifications from '../../hooks/useNotifications';
import { computeExecutiveHealthMetrics } from '../../services/firebase/reportService';

import BorrowTrendChart from '../../components/dashboard/BorrowTrendChart';
import SystemHealthWidget from '../../components/dashboard/SystemHealthWidget';
import TodayActivityPanel from '../../components/dashboard/TodayActivityPanel';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const { books, addBook } = useBooks();
  const { requests, approveRequest, rejectRequest } = useBorrowRequests();
  const { transactions, issueBook, returnBook } = useTransactions();
  const { students } = useStudents();
  const { notifications } = useNotifications();

  // Quick Action Dialog States
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [returnBookOpen, setReturnBookOpen] = useState(false);

  // Form Inputs
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Computer Science');
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [returnTransactionId, setReturnTransactionId] = useState('');

  // Executive KPI & Operational Summary Calculation
  const healthMetrics = useMemo(() => {
    return computeExecutiveHealthMetrics(books, transactions, requests, students);
  }, [books, transactions, requests, students]);

  // Today's Date & Greeting
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const pendingRequestsList = useMemo(() => {
    return requests.filter((r) => r.status === 'Pending').slice(0, 5);
  }, [requests]);

  const recentTransactionsList = useMemo(() => {
    return (transactions || []).slice(0, 5);
  }, [transactions]);

  const handleApproveRequest = async (id) => {
    try {
      await approveRequest(id, 14);
      toast.success('Request approved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve request');
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await rejectRequest(id, 'Rejected by Librarian');
      toast.success('Request rejected');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject request');
    }
  };

  const handleCreateBookSubmit = async () => {
    if (!newBookTitle || !newBookIsbn) {
      toast.error('Please fill in book title and ISBN');
      return;
    }
    try {
      await addBook({
        title: newBookTitle,
        isbn: newBookIsbn,
        author: newBookAuthor || 'Unknown Author',
        category: newBookCategory,
        totalCopies: 1,
      });
      setNewBookTitle('');
      setNewBookIsbn('');
      setNewBookAuthor('');
      setAddBookOpen(false);
      toast.success('Book added to catalog');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add book');
    }
  };

  const handleIssueBookSubmit = async () => {
    if (!issueStudentId || !issueBookId) {
      toast.error('Please enter student ID and book ID');
      return;
    }
    try {
      const student = students.find(
        (s) =>
          (s.registerNumber || '').toLowerCase() === issueStudentId.trim().toLowerCase() ||
          (s.id || '').toLowerCase() === issueStudentId.trim().toLowerCase()
      );

      await issueBook({
        studentId: student?.id || issueStudentId,
        studentName: student?.fullName || `Student (${issueStudentId})`,
        registerNumber: student?.registerNumber || issueStudentId,
        department: student?.department || 'Computer Science',
        bookId: issueBookId,
        bookTitle: 'Library Collection Book',
      });

      setIssueStudentId('');
      setIssueBookId('');
      setIssueBookOpen(false);
      toast.success('Book checkout completed');
    } catch (err) {
      toast.error(err.message || 'Failed to issue book');
    }
  };

  const handleReturnBookSubmit = async () => {
    if (!returnTransactionId) {
      toast.error('Please enter transaction ID');
      return;
    }
    try {
      await returnBook(returnTransactionId.trim(), 'Good', 'Returned via quick action');
      setReturnTransactionId('');
      setReturnBookOpen(false);
      toast.success('Book return recorded');
    } catch (err) {
      toast.error(err.message || 'Failed to return book');
    }
  };

  // Columns for Pending Requests Table
  const pendingColumns = [
    {
      id: 'bookTitle',
      label: 'Book Information',
      minWidth: 200,
      format: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 32,
              height: 42,
              borderRadius: '4px',
              backgroundColor: BORROW_COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 700,
              fontSize: '0.65rem',
              overflow: 'hidden',
            }}
          >
            {row.bookCoverUrl ? (
              <img src={row.bookCoverUrl} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'BOOK'
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
              {val || row.title}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              ID: {row.requestId || row.id}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'studentName',
      label: 'Student',
      minWidth: 150,
      format: (val, row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.registerNumber || row.studentId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'requestDate',
      label: 'Requested Time',
      minWidth: 120,
      format: (val) => (val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 100,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              onClick={() => handleApproveRequest(row.id)}
              sx={{
                backgroundColor: BORROW_COLORS.successLight,
                color: BORROW_COLORS.success,
                '&:hover': { backgroundColor: '#BBF7D0' },
                p: 0.5,
              }}
            >
              <CheckIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              onClick={() => handleRejectRequest(row.id)}
              sx={{
                backgroundColor: BORROW_COLORS.errorLight,
                color: BORROW_COLORS.error,
                '&:hover': { backgroundColor: '#FCA5A5' },
                p: 0.5,
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Columns for Recent Transactions Table
  const transactionColumns = [
    {
      id: 'studentName',
      label: 'Student',
      minWidth: 160,
      format: (val, row) => (
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {val || 'Student User'}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.registerNumber || row.studentId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'bookTitle',
      label: 'Book',
      minWidth: 200,
      format: (val) => (
        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
          {val || 'Library Book'}
        </Typography>
      ),
    },
    {
      id: 'type',
      label: 'Action',
      minWidth: 110,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 600, color: val === 'return' ? BORROW_COLORS.success : BORROW_COLORS.primary }}>
          {val === 'return' ? 'Book Return' : 'Checkout'}
        </Typography>
      ),
    },
    {
      id: 'issueDate',
      label: 'Time',
      minWidth: 120,
      format: (val, row) => {
        const d = val || row.returnDate || row.createdAt;
        return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (val) => <StatusChip status={val || 'Completed'} />,
    },
  ];

  return (
    <PageContainer
      title="Dashboard"
      subtitle={`${todayFormatted} — Operational overview & circulation status.`}
      actions={
        <CustomButton
          variant="primary"
          startIcon={<BookmarkAddOutlinedIcon />}
          onClick={() => setAddBookOpen(true)}
        >
          + Add Book
        </CustomButton>
      }
    >
      {/* 1. PRIMARY KPI SECTION (Strictly 4 Cards) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Total Books"
            value={healthMetrics.totalTitles.toLocaleString()}
            subtitle="catalog titles"
            icon={MenuBookIcon}
            iconBgColor={BORROW_COLORS.primarySurface}
            iconColor={BORROW_COLORS.primary}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Available Books"
            value={healthMetrics.availableCopies.toLocaleString()}
            subtitle="on shelf ready"
            icon={CheckCircleOutlineIcon}
            iconBgColor={BORROW_COLORS.successLight}
            iconColor={BORROW_COLORS.success}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Borrowed Books"
            value={healthMetrics.borrowedCopies.toLocaleString()}
            subtitle="active loans"
            icon={SwapHorizontalCircleOutlinedIcon}
            iconBgColor={BORROW_COLORS.warningLight}
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Pending Requests"
            value={healthMetrics.pendingRequests.toLocaleString()}
            subtitle="action required"
            icon={PendingActionsIcon}
            iconBgColor="rgba(245, 158, 11, 0.15)"
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>
      </Grid>

      {/* 2. QUICK ACTIONS TOOLBAR */}
      <Card
        sx={{
          mb: 3.5,
          backgroundColor: BORROW_COLORS.surface,
          border: `1px solid ${BORROW_COLORS.border}`,
          borderRadius: '12px',
          boxShadow: BORROW_COLORS.cardShadow,
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
              Quick Actions
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              Frequent Librarian Tasks
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
            <CustomButton
              variant="primary"
              size="small"
              startIcon={<BookmarkAddOutlinedIcon />}
              onClick={() => setAddBookOpen(true)}
            >
              Add Book
            </CustomButton>

            <CustomButton
              variant="secondary"
              size="small"
              startIcon={<MenuBookIcon />}
              onClick={() => setIssueBookOpen(true)}
            >
              Issue Book
            </CustomButton>

            <CustomButton
              variant="secondary"
              size="small"
              startIcon={<AssignmentReturnedOutlinedIcon />}
              onClick={() => setReturnBookOpen(true)}
            >
              Return Book
            </CustomButton>

            <CustomButton
              variant="outline"
              size="small"
              startIcon={<QrCodeScannerOutlinedIcon />}
              onClick={() => navigate(ROUTES.SCANNER)}
            >
              Scan QR
            </CustomButton>

            <CustomButton
              variant="outline"
              size="small"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => navigate(ROUTES.STUDENTS)}
            >
              Add Student
            </CustomButton>

            <CustomButton
              variant="ghost"
              size="small"
              startIcon={<PendingActionsIcon />}
              onClick={() => navigate(ROUTES.REQUESTS)}
            >
              Approve Requests ({healthMetrics.pendingRequests})
            </CustomButton>
          </Box>
        </CardContent>
      </Card>

      {/* 3. OPERATIONAL GRID: PENDING REQUESTS & TODAY'S ACTIVITY */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Left Column: Pending Requests Panel */}
        <Grid item xs={12} lg={7}>
          <SectionHeader
            title="Pending Requests"
            subtitle="Student checkout requests requiring librarian decision"
            action={
              <CustomButton
                variant="ghost"
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(ROUTES.REQUESTS)}
              >
                View All
              </CustomButton>
            }
          />

          <CustomTable
            columns={pendingColumns}
            data={pendingRequestsList}
            rowsPerPage={5}
            emptyType="requests"
            emptyTitle="No Pending Approvals"
            emptyDescription="All student borrow requests have been processed!"
          />
        </Grid>

        {/* Right Column: Today's Activity & Recent Notifications */}
        <Grid item xs={12} lg={5}>
          {/* Today's Operational Summary */}
          <TodayActivityPanel
            todayIssues={healthMetrics.todayIssues}
            todayReturns={healthMetrics.todayReturns}
            todayStudents={students.length}
            pendingRequests={healthMetrics.pendingRequests}
            sx={{ mb: 2.5 }}
          />

          {/* Recent Notifications Panel */}
          <Card
            sx={{
              borderRadius: '12px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              boxShadow: BORROW_COLORS.cardShadow,
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NotificationsOutlinedIcon sx={{ fontSize: 18, color: BORROW_COLORS.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                    Recent Notifications
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate(ROUTES.NOTIFICATIONS)}
                  sx={{ fontSize: '0.75rem', textTransform: 'none', color: BORROW_COLORS.primary }}
                >
                  View All
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 3).map((notif) => (
                    <Box
                      key={notif.id}
                      sx={{
                        p: 1.25,
                        borderRadius: '8px',
                        backgroundColor: BORROW_COLORS.background,
                        border: `1px solid ${BORROW_COLORS.border}`,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {notif.title || 'System Notification'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, fontSize: '0.75rem', mt: 0.25 }} noWrap>
                        {notif.message || notif.content || 'Notice posted to admin log.'}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, py: 1 }}>
                    No unread notifications.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 4. CIRCULATION TREND CHART */}
      <Box sx={{ mb: 3.5 }}>
        <BorrowTrendChart transactions={transactions} />
      </Box>

      {/* 5. RECENT TRANSACTIONS */}
      <Box sx={{ mb: 3.5 }}>
        <SectionHeader
          title="Recent Transactions"
          subtitle="Latest circulation activity log"
          action={
            <CustomButton
              variant="ghost"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate(ROUTES.RETURNS)}
            >
              View All
            </CustomButton>
          }
        />

        <CustomTable
          columns={transactionColumns}
          data={recentTransactionsList}
          rowsPerPage={5}
          emptyType="activity"
          emptyTitle="No Recent Activity"
          emptyDescription="No borrowing or return transactions recorded today."
        />
      </Box>

      {/* 6. SYSTEM HEALTH WIDGET */}
      <Box>
        <SystemHealthWidget status={healthMetrics.systemStatus} />
      </Box>

      {/* --- QUICK ACTION MODALS --- */}

      {/* Modal 1: Add New Book */}
      <CustomDialog
        open={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        title="Add New Book"
        subtitle="Insert a new book entry into the library catalog."
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setAddBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleCreateBookSubmit}>
              Save Book
            </CustomButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Book Title"
            fullWidth
            required
            value={newBookTitle}
            onChange={(e) => setNewBookTitle(e.target.value)}
          />
          <TextField
            label="Author"
            fullWidth
            value={newBookAuthor}
            onChange={(e) => setNewBookAuthor(e.target.value)}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="ISBN"
                fullWidth
                required
                value={newBookIsbn}
                onChange={(e) => setNewBookIsbn(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Category"
                select
                fullWidth
                value={newBookCategory}
                onChange={(e) => setNewBookCategory(e.target.value)}
              >
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Fiction">Fiction</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
      </CustomDialog>

      {/* Modal 2: Issue Book */}
      <CustomDialog
        open={issueBookOpen}
        onClose={() => setIssueBookOpen(false)}
        title="Issue Book to Student"
        subtitle="Assign a physical copy to a registered student."
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setIssueBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleIssueBookSubmit}>
              Confirm Checkout
            </CustomButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Student ID / Register No"
            placeholder="ST-2024-001"
            fullWidth
            required
            value={issueStudentId}
            onChange={(e) => setIssueStudentId(e.target.value)}
          />
          <TextField
            label="Book Document ID"
            placeholder="Document ID from Firestore Books"
            fullWidth
            required
            value={issueBookId}
            onChange={(e) => setIssueBookId(e.target.value)}
          />
        </Box>
      </CustomDialog>

      {/* Modal 3: Return Book */}
      <CustomDialog
        open={returnBookOpen}
        onClose={() => setReturnBookOpen(false)}
        title="Log Book Return"
        subtitle="Process returned book and check condition."
        actions={
          <>
            <CustomButton variant="outline" onClick={() => setReturnBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="primary" onClick={handleReturnBookSubmit}>
              Process Return
            </CustomButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Borrow Transaction Document ID"
            placeholder="Firestore Transaction Document ID"
            fullWidth
            required
            value={returnTransactionId}
            onChange={(e) => setReturnTransactionId(e.target.value)}
          />
        </Box>
      </CustomDialog>
    </PageContainer>
  );
};

export default DashboardPage;
