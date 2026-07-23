import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BookmarkAddOutlinedIcon from '@mui/icons-material/BookmarkAddOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AssignmentReturnedOutlinedIcon from '@mui/icons-material/AssignmentReturnedOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
import useActivity from '../../hooks/useActivity';
import { computeExecutiveHealthMetrics } from '../../services/firebase/reportService';

export const DashboardPage = () => {
  const navigate = useNavigate();

  const { books, stats: bookStats, addBook } = useBooks();
  const { requests, approveRequest, rejectRequest } = useBorrowRequests();
  const { transactions, issueBook, returnBook } = useTransactions();
  const { students } = useStudents();
  const { activities } = useActivity();

  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [returnBookOpen, setReturnBookOpen] = useState(false);

  // Form States
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Computer Science');
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [returnTransactionId, setReturnTransactionId] = useState('');

  // Executive Health Metrics & System Alerts Calculation
  const healthMetrics = useMemo(() => {
    return computeExecutiveHealthMetrics(books, transactions, requests, students);
  }, [books, transactions, requests, students]);

  const handleApproveRequest = async (id) => {
    try {
      await approveRequest(id, 14);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await rejectRequest(id, 'Rejected by Librarian');
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueBookSubmit = async () => {
    if (!issueStudentId || !issueBookId) {
      toast.error('Please enter student register number and book ID');
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
    } catch (err) {
      toast.error(err.message || 'Failed to return book');
    }
  };

  // Table Columns Setup
  const requestColumns = [
    {
      id: 'bookTitle',
      label: 'Book Information',
      minWidth: 240,
      format: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 48,
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {row.bookCoverUrl ? (
              <img src={row.bookCoverUrl} alt={val} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              'BOOK'
            )}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
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
      minWidth: 160,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
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
      label: 'Date & Time',
      minWidth: 140,
      format: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A'),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (val) => <StatusChip status={val} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'right',
      format: (_, row) =>
        row.status === 'Pending' ? (
          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
            <Tooltip title="Approve Request">
              <IconButton
                size="small"
                onClick={() => handleApproveRequest(row.id)}
                sx={{
                  backgroundColor: BORROW_COLORS.successLight,
                  color: BORROW_COLORS.success,
                  '&:hover': { backgroundColor: '#BBF7D0' },
                }}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reject Request">
              <IconButton
                size="small"
                onClick={() => handleRejectRequest(row.id)}
                sx={{
                  backgroundColor: BORROW_COLORS.errorLight,
                  color: BORROW_COLORS.error,
                  '&:hover': { backgroundColor: '#FCA5A5' },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
            Processed
          </Typography>
        ),
    },
  ];

  return (
    <PageContainer
      title="Executive Dashboard"
      subtitle="Real-time operational metrics, circulation health alerts, and instant quick actions."
    >
      {/* 1. Real-Time System Alerts Banner if warnings exist */}
      {healthMetrics.alerts && healthMetrics.alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {healthMetrics.alerts.map((alert) => (
            <Alert key={alert.id} severity={alert.type} sx={{ mb: 1, borderRadius: '12px', fontWeight: 600 }}>
              <AlertTitle sx={{ fontWeight: 800 }}>Real-Time System Notification</AlertTitle>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* 2. Executive Metric Statistics Grid (12 Cards) */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Total Books"
            value={healthMetrics.totalTitles.toLocaleString()}
            subtitle="catalog titles"
            icon={MenuBookIcon}
            iconBgColor="rgba(37, 99, 235, 0.1)"
            iconColor={BORROW_COLORS.primary}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Available"
            value={healthMetrics.availableCopies.toLocaleString()}
            subtitle="copies on shelf"
            icon={CheckCircleOutlineIcon}
            iconBgColor={BORROW_COLORS.successLight}
            iconColor={BORROW_COLORS.success}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Borrowed"
            value={healthMetrics.borrowedCopies.toLocaleString()}
            subtitle="active loans"
            icon={SwapHorizontalCircleOutlinedIcon}
            iconBgColor={BORROW_COLORS.warningLight}
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Overdue"
            value={healthMetrics.overdueCount.toLocaleString()}
            subtitle="past due date"
            icon={WarningAmberIcon}
            iconBgColor={BORROW_COLORS.errorLight}
            iconColor={BORROW_COLORS.error}
            onClick={() => navigate(ROUTES.RETURNS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Pending Req."
            value={healthMetrics.pendingRequests.toLocaleString()}
            subtitle="action required"
            icon={PendingActionsIcon}
            iconBgColor="rgba(245, 158, 11, 0.15)"
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Returned Today"
            value={healthMetrics.todayReturns.toLocaleString()}
            subtitle="checked in"
            icon={AssignmentReturnOutlinedIcon}
            iconBgColor={BORROW_COLORS.infoLight}
            iconColor={BORROW_COLORS.info}
            onClick={() => navigate(ROUTES.RETURNS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Today's Issues"
            value={healthMetrics.todayIssues.toLocaleString()}
            subtitle="checked out"
            icon={MenuBookOutlinedIcon}
            iconBgColor="rgba(37, 99, 235, 0.1)"
            iconColor={BORROW_COLORS.primary}
            onClick={() => navigate(ROUTES.RETURNS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Damaged"
            value={healthMetrics.damagedCopies.toLocaleString()}
            subtitle="needs repair"
            icon={ReportProblemIcon}
            iconBgColor={BORROW_COLORS.warningLight}
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Lost Copies"
            value={healthMetrics.lostCopies.toLocaleString()}
            subtitle="unreturned"
            icon={ReportProblemIcon}
            iconBgColor={BORROW_COLORS.errorLight}
            iconColor={BORROW_COLORS.error}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Expired Res."
            value={healthMetrics.expiredReservations.toLocaleString()}
            subtitle="uncollected"
            icon={PendingActionsIcon}
            iconBgColor="rgba(100, 116, 139, 0.1)"
            iconColor="#64748B"
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="Active Students"
            value={healthMetrics.totalStudents.toLocaleString()}
            subtitle="registered"
            icon={PeopleOutlineIcon}
            iconBgColor="rgba(139, 92, 246, 0.1)"
            iconColor="#8B5CF6"
            onClick={() => navigate(ROUTES.STUDENTS)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={2}>
          <DashboardCard
            title="System Health"
            value={healthMetrics.systemStatus}
            subtitle="operational status"
            icon={CheckCircleOutlineIcon}
            iconBgColor={healthMetrics.systemStatus === 'Healthy' ? BORROW_COLORS.successLight : BORROW_COLORS.warningLight}
            iconColor={healthMetrics.systemStatus === 'Healthy' ? BORROW_COLORS.success : BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REPORTS)}
          />
        </Grid>
      </Grid>

      {/* 3. Quick Actions Banner */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          p: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
                Quick Librarian Actions
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                Perform instant inventory additions, issue books, or process return receipts.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <CustomButton
                variant="contained"
                startIcon={<BookmarkAddOutlinedIcon />}
                onClick={() => setAddBookOpen(true)}
                sx={{ background: BORROW_COLORS.primaryGradient }}
              >
                Add New Book
              </CustomButton>

              <CustomButton
                variant="outlined"
                startIcon={<MenuBookOutlinedIcon />}
                onClick={() => setIssueBookOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF' } }}
              >
                Issue Book
              </CustomButton>

              <CustomButton
                variant="outlined"
                startIcon={<AssignmentReturnedOutlinedIcon />}
                onClick={() => setReturnBookOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF' } }}
              >
                Return Book
              </CustomButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 4. Main Data Sections Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Recent Borrow Requests Table */}
        <Grid item xs={12} lg={8}>
          <SectionHeader
            title="Recent Borrow Requests"
            subtitle="Student requests waiting for librarian approval"
            action={
              <CustomButton
                variant="text"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate(ROUTES.REQUESTS)}
                sx={{ color: BORROW_COLORS.primary }}
              >
                View All Requests
              </CustomButton>
            }
          />

          <CustomTable
            columns={requestColumns}
            data={requests}
            rowsPerPage={5}
            emptyType="requests"
            emptyTitle="No Pending Requests"
            emptyDescription="All student borrow requests have been processed!"
          />
        </Grid>

        {/* Right Column: Live Activity Feed */}
        <Grid item xs={12} lg={4}>
          <SectionHeader title="Live Activity Feed" subtitle="Real-time operations timeline" />

          <Card sx={{ height: 'calc(100% - 48px)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {activities.length > 0 ? (
                  activities.slice(0, 6).map((act) => (
                    <motion.div
                      key={act.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            backgroundColor:
                              act.type === 'request'
                                ? 'rgba(37, 99, 235, 0.1)'
                                : act.type === 'return'
                                ? BORROW_COLORS.successLight
                                : BORROW_COLORS.infoLight,
                            color:
                              act.type === 'request'
                                ? BORROW_COLORS.primary
                                : act.type === 'return'
                                ? BORROW_COLORS.success
                                : BORROW_COLORS.info,
                          }}
                        >
                          {(act.user || act.performedBy || 'A')[0]}
                        </Avatar>

                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, lineHeight: 1.4 }}>
                            <strong>{act.user || act.performedBy || 'System Admin'}</strong> {act.action || act.activityType}{' '}
                            <span style={{ color: BORROW_COLORS.primary, fontWeight: 600 }}>
                              "{act.target || act.affectedDocumentName || ''}"
                            </span>
                          </Typography>
                          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mt: 0.25, display: 'block' }}>
                            {act.time || 'Just now'}
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, textAlign: 'center', py: 4 }}>
                    No recent activities recorded.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* --- QUICK ACTION MODALS --- */}

      {/* Modal 1: Add New Book */}
      <CustomDialog
        open={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        title="Add New Book"
        subtitle="Insert a new book entry into the library catalog."
        actions={
          <>
            <CustomButton variant="outlined" onClick={() => setAddBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="contained" onClick={handleCreateBookSubmit}>
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
            <CustomButton variant="outlined" onClick={() => setIssueBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="contained" onClick={handleIssueBookSubmit}>
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
            <CustomButton variant="outlined" onClick={() => setReturnBookOpen(false)}>
              Cancel
            </CustomButton>
            <CustomButton variant="contained" onClick={handleReturnBookSubmit}>
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
