import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const TransactionDrawer = ({ open, onClose, transaction, onReturn }) => {
  if (!transaction) return null;

  const status = transaction.computedStatus || transaction.status || 'Issued';
  const isOverdue = transaction.dueDate && new Date(transaction.dueDate) < new Date() && status !== 'Returned';

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520, md: 580 },
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
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            Circulation Transaction Details
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
            ID: {transaction.id || transaction.transactionId}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: BORROW_COLORS.textMuted }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Main Drawer Body */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Status Header Bar */}
        <Box
          sx={{
            p: 2,
            borderRadius: '10px',
            backgroundColor: BORROW_COLORS.background,
            border: `1px solid ${BORROW_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontWeight: 600, fontSize: '0.6875rem' }}>
              CIRCULATION STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <StatusBadge status={isOverdue ? 'Overdue' : status} size="small" />
              {transaction.condition && <StatusBadge status={transaction.condition} size="small" />}
            </Box>
          </Box>

          {(status === 'Issued' || status === 'Borrowed' || isOverdue) && (
            <CustomButton
              variant="primary"
              size="small"
              startIcon={<AssignmentReturnedIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                onClose();
                onReturn(transaction);
              }}
              sx={{ backgroundColor: BORROW_COLORS.success, '&:hover': { backgroundColor: '#15803D' } }}
            >
              Process Check-in Return
            </CustomButton>
          )}
        </Box>

        {/* Student Information */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block', letterSpacing: '0.05em' }}>
            STUDENT DETAILS
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: '10px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              src={transaction.studentAvatar || ''}
              alt={transaction.studentName}
              sx={{ width: 44, height: 44, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '1rem' }}
            >
              {(transaction.studentName || 'S')[0]}
            </Avatar>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                {transaction.studentName}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                Reg No: {transaction.registerNumber || transaction.studentId}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                {transaction.department || 'Computer Science'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Book Information */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block', letterSpacing: '0.05em' }}>
            ISSUED BOOK DETAILS
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: '10px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              display: 'flex',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 88,
                borderRadius: '6px',
                overflow: 'hidden',
                flexShrink: 0,
                border: `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: '#F1F5F9',
              }}
            >
              <img
                src={transaction.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                alt={transaction.bookTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, mb: 0.25 }}>
                {transaction.bookTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                By {transaction.bookAuthor || 'Unknown Author'}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                COPY ID: {transaction.bookCopyId || transaction.copyId || 'CPY-DEFAULT'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Dates Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>CHECKOUT ISSUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {transaction.issueDate ? format(new Date(transaction.issueDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>RETURN DUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: isOverdue ? BORROW_COLORS.error : BORROW_COLORS.primary }}>
              {transaction.dueDate ? format(new Date(transaction.dueDate), 'dd MMM yyyy') : '14 Days'}
            </Typography>
          </Grid>
          {transaction.returnDate && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>ACTUAL RETURN DATE</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.success }}>
                {format(new Date(transaction.returnDate), 'dd MMM yyyy, hh:mm a')} (Processed by {transaction.returnedBy || 'Admin'})
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Notes */}
        {transaction.notes && (
          <Box sx={{ p: 1.75, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.textMuted }}>
              LIBRARIAN NOTES
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
              "{transaction.notes}"
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default TransactionDrawer;
