import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';

export const StudentProfileDrawer = ({ open, onClose, student }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!student) return null;

  const currentBooks = student.activeTxns || [];
  const pastTxns = (student.studentTxns || []).filter((t) => t.status === 'Returned' || t.computedStatus === 'Returned');
  const pendingRequests = student.studentReqs || [];
  const timelineLogs = student.activityTimeline || [];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 560, md: 640 },
          p: 0,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      {/* Drawer Sticky Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          backgroundColor: BORROW_COLORS.surface,
          zIndex: 10,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
          Student Member Profile
        </Typography>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Overdue Warning Alert */}
        {student.hasOverdue && (
          <Alert
            severity="error"
            icon={<WarningAmberIcon />}
            sx={{ borderRadius: '14px', fontWeight: 700, border: `1px solid ${BORROW_COLORS.error}` }}
          >
            ATTENTION: This student has overdue book checkouts requiring immediate return or librarian action!
          </Alert>
        )}

        {/* Profile Card Header */}
        <Box
          sx={{
            p: 3,
            borderRadius: '20px',
            backgroundColor: '#F8FAFC',
            border: `1px solid ${BORROW_COLORS.border}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2.5,
          }}
        >
          <Avatar
            src={student.avatarUrl || ''}
            alt={student.fullName || student.name}
            sx={{
              width: 72,
              height: 72,
              bgcolor: BORROW_COLORS.primary,
              fontWeight: 800,
              fontSize: '1.75rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            }}
          >
            {(student.fullName || student.name || 'S')[0]}
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                {student.fullName || student.name}
              </Typography>
              <StatusChip status={student.computedStatus || student.status} />
            </Box>

            <Typography variant="subtitle2" sx={{ color: BORROW_COLORS.primary, fontWeight: 800, mb: 1 }}>
              Reg No: {student.registerNumber}
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: BORROW_COLORS.textSecondary }}>
                  <SchoolIcon fontSize="small" />
                  <Typography variant="caption" noWrap sx={{ fontWeight: 600 }}>
                    {student.department} ({student.year})
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: BORROW_COLORS.textSecondary }}>
                  <EmailIcon fontSize="small" />
                  <Typography variant="caption" noWrap sx={{ fontWeight: 600 }}>
                    {student.email || 'student@borrow.edu'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: BORROW_COLORS.border }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`Current Books (${currentBooks.length})`} sx={{ fontWeight: 700 }} />
            <Tab label={`History (${pastTxns.length})`} sx={{ fontWeight: 700 }} />
            <Tab label={`Requests (${pendingRequests.length})`} sx={{ fontWeight: 700 }} />
            <Tab label="Activity Log" sx={{ fontWeight: 700 }} />
          </Tabs>
        </Box>

        {/* Tab 0: Currently Borrowed Books */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentBooks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
                  This student currently has no active book checkouts.
                </Typography>
              </Box>
            ) : (
              currentBooks.map((txn) => (
                <Box
                  key={txn.id}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: `1px solid ${txn.isOverdue ? BORROW_COLORS.error : BORROW_COLORS.border}`,
                    backgroundColor: txn.isOverdue ? '#FEF2F2' : BORROW_COLORS.surface,
                    display: 'flex',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 54,
                      height: 75,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#F1F5F9',
                    }}
                  >
                    <img
                      src={txn.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                      alt={txn.bookTitle}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>

                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                      {txn.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, display: 'block' }}>
                      Copy ID: {txn.bookCopyId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.5 }}>
                      Issued: {txn.issueDate ? format(new Date(txn.issueDate), 'dd MMM yyyy') : 'N/A'} • Due: {txn.dueDate ? format(new Date(txn.dueDate), 'dd MMM yyyy') : 'N/A'}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    {txn.isOverdue ? (
                      <Chip
                        label={`${txn.daysOverdue || 5}D OVERDUE`}
                        size="small"
                        sx={{ backgroundColor: BORROW_COLORS.errorLight, color: BORROW_COLORS.error, fontWeight: 800, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Chip
                        label={`${txn.daysRemaining || 7}d left`}
                        size="small"
                        sx={{ backgroundColor: BORROW_COLORS.infoLight, color: BORROW_COLORS.info, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 1: Borrowing History */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pastTxns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
                  No historical returned checkouts on record for this student.
                </Typography>
              </Box>
            ) : (
              pastTxns.map((txn) => (
                <Box
                  key={txn.id}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    backgroundColor: BORROW_COLORS.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      {txn.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                      Returned on: {txn.returnDate ? format(new Date(txn.returnDate), 'dd MMM yyyy') : 'N/A'} • Condition: <strong>{txn.condition || 'Good'}</strong>
                    </Typography>
                  </Box>

                  <Chip label="Completed" size="small" sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 700 }} />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pendingRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
                  No pending borrow applications for this student.
                </Typography>
              </Box>
            ) : (
              pendingRequests.map((req) => (
                <Box
                  key={req.id}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    backgroundColor: BORROW_COLORS.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                      {req.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                      Requested: {req.requestDate ? format(new Date(req.requestDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                    </Typography>
                  </Box>

                  <Chip label="Pending Approval" size="small" sx={{ backgroundColor: BORROW_COLORS.warningLight, color: BORROW_COLORS.warning, fontWeight: 700 }} />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 3: Activity Log */}
        {activeTab === 3 && (
          <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
            {timelineLogs.length === 0 ? (
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, text: 'center' }}>
                No recorded system activity logs yet.
              </Typography>
            ) : (
              timelineLogs.map((log, idx) => (
                <Box key={idx} sx={{ mb: idx === timelineLogs.length - 1 ? 0 : 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                    {log.event}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    {format(new Date(log.timestamp), 'dd MMM yyyy, hh:mm a')} • {log.details}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default StudentProfileDrawer;
