import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const StudentProfileDrawer = ({
  open,
  onClose,
  student,
  onIssueBook,
  onNotify,
  onReturnBook,
  onRenewBook,
}) => {
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
          width: { xs: '100%', sm: 540, md: 600 },
          p: 0,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          p: 2.5,
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
        <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
          Student Member Profile
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: BORROW_COLORS.textMuted }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Main Drawer Content */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Overdue Warning Alert if any */}
        {student.hasOverdue && (
          <Alert
            severity="error"
            icon={<WarningAmberIcon />}
            sx={{ borderRadius: '8px', fontWeight: 600, border: `1px solid ${BORROW_COLORS.errorLight}` }}
          >
            ATTENTION: Student has overdue checkouts requiring return action!
          </Alert>
        )}

        {/* Profile Card Summary Header */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '12px',
            backgroundColor: BORROW_COLORS.background,
            border: `1px solid ${BORROW_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Avatar
            src={student.avatarUrl || ''}
            alt={student.fullName || student.name}
            sx={{ width: 64, height: 64, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '1.5rem' }}
          >
            {(student.fullName || student.name || 'S')[0]}
          </Avatar>

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                {student.fullName || student.name}
              </Typography>
              <StatusBadge status={student.computedStatus || student.status || 'Active'} size="small" />
            </Box>

            <Typography variant="subtitle2" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, mb: 0.5 }}>
              Reg No: {student.registerNumber}
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                  <strong>Dept:</strong> {student.department || 'CS'} (Year {student.year || '3'})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                  <strong>Email:</strong> {student.email || 'student@borrow.edu'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Box>

        {/* Quick Action Buttons Row inside Drawer */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <CustomButton
            variant="primary"
            size="small"
            onClick={() => onIssueBook && onIssueBook(student)}
            startIcon={<MenuBookOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ flex: 1 }}
          >
            Issue Book
          </CustomButton>

          <CustomButton
            variant="outline"
            size="small"
            onClick={() => onNotify && onNotify(student)}
            startIcon={<NotificationsOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{ flex: 1 }}
          >
            Send Notification
          </CustomButton>
        </Box>

        {/* Profile Tabs */}
        <Box sx={{ borderBottom: `1px solid ${BORROW_COLORS.border}` }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
                minHeight: 36,
                px: 1.5,
              },
            }}
          >
            <Tab label={`Active Loans (${currentBooks.length})`} />
            <Tab label={`Borrow History (${pastTxns.length})`} />
            <Tab label={`Pending Reqs (${pendingRequests.length})`} />
            <Tab label="Activity Logs" />
          </Tabs>
        </Box>

        {/* Tab 0: Active Loans */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {currentBooks.length === 0 ? (
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textMuted, py: 2, textAlign: 'center' }}>
                No active loans currently checked out to this student.
              </Typography>
            ) : (
              currentBooks.map((txn) => (
                <Box
                  key={txn.id}
                  sx={{
                    p: 1.75,
                    borderRadius: '8px',
                    border: `1px solid ${txn.isOverdue ? BORROW_COLORS.error : BORROW_COLORS.border}`,
                    backgroundColor: BORROW_COLORS.surface,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 56,
                      borderRadius: '4px',
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
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                      {txn.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                      Copy ID: {txn.bookCopyId || 'CPY-DEFAULT'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>
                      Due: {txn.dueDate ? format(new Date(txn.dueDate), 'dd MMM yyyy') : '14 Days'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                    <StatusBadge status={txn.isOverdue ? 'Overdue' : 'Issued'} size="small" />
                    <CustomButton
                      variant="secondary"
                      size="small"
                      onClick={() => onReturnBook && onReturnBook(txn)}
                      sx={{ fontSize: '0.71875rem', py: 0.25, px: 0.75 }}
                    >
                      Return
                    </CustomButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 1: Borrow History Timeline */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pastTxns.length === 0 ? (
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textMuted, py: 2, textAlign: 'center' }}>
                No historical returned checkouts on record.
              </Typography>
            ) : (
              pastTxns.map((txn) => (
                <Box
                  key={txn.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    backgroundColor: BORROW_COLORS.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                      {txn.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
                      Returned: {txn.returnDate ? format(new Date(txn.returnDate), 'dd MMM yyyy') : 'N/A'} • Condition: {txn.condition || 'Good'}
                    </Typography>
                  </Box>
                  <StatusBadge status="Returned" size="small" />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 2: Pending Requests */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {pendingRequests.length === 0 ? (
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textMuted, py: 2, textAlign: 'center' }}>
                No pending borrow applications for this student.
              </Typography>
            ) : (
              pendingRequests.map((req) => (
                <Box
                  key={req.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    border: `1px solid ${BORROW_COLORS.border}`,
                    backgroundColor: BORROW_COLORS.background,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                      {req.bookTitle}
                    </Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
                      Requested: {req.requestDate ? format(new Date(req.requestDate), 'dd MMM yyyy') : 'Today'}
                    </Typography>
                  </Box>
                  <StatusBadge status="Pending" size="small" />
                </Box>
              ))
            )}
          </Box>
        )}

        {/* Tab 3: Activity Logs */}
        {activeTab === 3 && (
          <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}` }}>
            {timelineLogs.length === 0 ? (
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block', textAlign: 'center' }}>
                No activity logs recorded.
              </Typography>
            ) : (
              timelineLogs.map((log, idx) => (
                <Box key={idx} sx={{ mb: idx === timelineLogs.length - 1 ? 0 : 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                    {log.event}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
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
