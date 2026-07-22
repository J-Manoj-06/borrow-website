import React, { useState } from 'react';
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
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AddBookIcon from '@mui/icons-material/BookmarkAddOutlined';
import IssueBookIcon from '@mui/icons-material/MenuBookOutlined';
import ReturnBookIcon from '@mui/icons-material/AssignmentReturnedOutlined';
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

// Mock Data for Dashboard Preview
const initialRequests = [
  {
    id: 'REQ-1048',
    bookTitle: 'Clean Code: Handbook of Software Craftsmanship',
    studentName: 'Alex Rivera',
    studentId: 'ST-2024-88',
    requestDate: 'Today, 10:45 AM',
    status: 'Pending',
    coverBg: '#2563EB',
  },
  {
    id: 'REQ-1047',
    bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    studentName: 'Sophia Chen',
    studentId: 'ST-2024-42',
    requestDate: 'Today, 09:15 AM',
    status: 'Pending',
    coverBg: '#3B82F6',
  },
  {
    id: 'REQ-1046',
    bookTitle: 'Introduction to Algorithms (4th Edition)',
    studentName: 'Marcus Vance',
    studentId: 'ST-2023-19',
    requestDate: 'Yesterday, 04:30 PM',
    status: 'Approved',
    coverBg: '#22C55E',
  },
  {
    id: 'REQ-1045',
    bookTitle: 'Artificial Intelligence: A Modern Approach',
    studentName: 'Emily Watson',
    studentId: 'ST-2024-05',
    requestDate: 'Yesterday, 02:10 PM',
    status: 'Returned',
    coverBg: '#F59E0B',
  },
  {
    id: 'REQ-1044',
    bookTitle: 'System Design Interview – An Insider\'s Guide',
    studentName: 'David Kalu',
    studentId: 'ST-2023-99',
    requestDate: '22 Jul, 11:20 AM',
    status: 'Pending',
    coverBg: '#8B5CF6',
  },
];

const mockActivities = [
  {
    id: 1,
    user: 'Sophia Chen',
    action: 'submitted borrow request for',
    target: 'Design Patterns',
    time: '15 mins ago',
    type: 'request',
  },
  {
    id: 2,
    user: 'Librarian Sarah',
    action: 'approved book return for',
    target: 'Artificial Intelligence',
    time: '1 hour ago',
    type: 'return',
  },
  {
    id: 3,
    user: 'Marcus Vance',
    action: 'checked out book',
    target: 'Introduction to Algorithms',
    time: '2 hours ago',
    type: 'issue',
  },
  {
    id: 4,
    user: 'System Admin',
    action: 'added 5 new copies of',
    target: 'Flutter Mobile Dev',
    time: '4 hours ago',
    type: 'add',
  },
];

export const DashboardPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(initialRequests);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueBookOpen, setIssueBookOpen] = useState(false);
  const [returnBookOpen, setReturnBookOpen] = useState(false);

  // Quick Action Modal Form States
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [returnBorrowId, setReturnBorrowId] = useState('');

  const handleApproveRequest = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    toast.success(`Borrow request ${id} approved successfully!`);
  };

  const handleRejectRequest = (id) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    toast.error(`Borrow request ${id} rejected.`);
  };

  const handleCreateBookSubmit = () => {
    if (!newBookTitle) {
      toast.error('Please enter a book title');
      return;
    }
    toast.success(`"${newBookTitle}" added to library inventory!`);
    setNewBookTitle('');
    setNewBookIsbn('');
    setNewBookAuthor('');
    setAddBookOpen(false);
  };

  const handleIssueBookSubmit = () => {
    if (!issueStudentId || !issueBookId) {
      toast.error('Please fill in student ID and book ID');
      return;
    }
    toast.success(`Book ${issueBookId} issued to Student ${issueStudentId}!`);
    setIssueStudentId('');
    setIssueBookId('');
    setIssueBookOpen(false);
  };

  const handleReturnBookSubmit = () => {
    if (!returnBorrowId) {
      toast.error('Please enter Borrow ID');
      return;
    }
    toast.success(`Book return logged for Borrow ID ${returnBorrowId}!`);
    setReturnBorrowId('');
    setReturnBookOpen(false);
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
              backgroundColor: row.coverBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 800,
              fontSize: '0.75rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            BOOK
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
              ID: {row.id}
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
            {row.studentId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'requestDate',
      label: 'Date & Time',
      minWidth: 140,
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
      format: (_, row) => (
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
        )
      ),
    },
  ];

  return (
    <PageContainer
      title="Dashboard Overview"
      subtitle="Live metrics, borrow request approvals, and inventory status."
    >
      {/* 1. Metric Statistics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Total Books"
            value="1,482"
            trend="+12%"
            subtitle="vs last month"
            icon={MenuBookIcon}
            iconBgColor="rgba(37, 99, 235, 0.1)"
            iconColor={BORROW_COLORS.primary}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Available"
            value="1,120"
            subtitle="75.5% in shelf"
            icon={CheckCircleOutlineIcon}
            iconBgColor={BORROW_COLORS.successLight}
            iconColor={BORROW_COLORS.success}
            onClick={() => navigate(ROUTES.BOOKS)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Borrowed"
            value="362"
            trend="+5%"
            subtitle="active loans"
            icon={SwapHorizontalCircleOutlinedIcon}
            iconBgColor={BORROW_COLORS.warningLight}
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Pending"
            value="18"
            trend="Action req."
            trendIsPositive={false}
            icon={PendingActionsIcon}
            iconBgColor="rgba(245, 158, 11, 0.15)"
            iconColor={BORROW_COLORS.warning}
            onClick={() => navigate(ROUTES.REQUESTS)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Returned Today"
            value="24"
            subtitle="processed"
            icon={AssignmentReturnOutlinedIcon}
            iconBgColor={BORROW_COLORS.infoLight}
            iconColor={BORROW_COLORS.info}
            onClick={() => navigate(ROUTES.RETURNS)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardCard
            title="Students"
            value="850"
            trend="+28 new"
            subtitle="registered"
            icon={PeopleOutlineIcon}
            iconBgColor="rgba(139, 92, 246, 0.1)"
            iconColor="#8B5CF6"
            onClick={() => navigate(ROUTES.STUDENTS)}
          />
        </Grid>
      </Grid>

      {/* 2. Quick Actions Banner */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          p: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
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
                startIcon={<AddBookIcon />}
                onClick={() => setAddBookOpen(true)}
                sx={{ background: BORROW_COLORS.primaryGradient }}
              >
                Add New Book
              </CustomButton>

              <CustomButton
                variant="outlined"
                startIcon={<IssueBookIcon />}
                onClick={() => setIssueBookOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF' } }}
              >
                Issue Book
              </CustomButton>

              <CustomButton
                variant="outlined"
                startIcon={<ReturnBookIcon />}
                onClick={() => setReturnBookOpen(true)}
                sx={{ borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', '&:hover': { borderColor: '#FFFFFF' } }}
              >
                Return Book
              </CustomButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 3. Main Data Sections Grid */}
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
                {mockActivities.map((act) => (
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
                        {act.user[0]}
                      </Avatar>

                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, lineHeight: 1.4 }}>
                          <strong>{act.user}</strong> {act.action}{' '}
                          <span style={{ color: BORROW_COLORS.primary, fontWeight: 600 }}>
                            "{act.target}"
                          </span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mt: 0.25, display: 'block' }}>
                          {act.time}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
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
                value={newBookIsbn}
                onChange={(e) => setNewBookIsbn(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Category" select fullWidth defaultValue="Computer Science">
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
            label="Student ID"
            placeholder="ST-2024-001"
            fullWidth
            required
            value={issueStudentId}
            onChange={(e) => setIssueStudentId(e.target.value)}
          />
          <TextField
            label="Book Barcode / ID"
            placeholder="BK-9942"
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
            label="Borrow Transaction ID"
            placeholder="REQ-1048"
            fullWidth
            required
            value={returnBorrowId}
            onChange={(e) => setReturnBorrowId(e.target.value)}
          />
        </Box>
      </CustomDialog>
    </PageContainer>
  );
};

export default DashboardPage;
