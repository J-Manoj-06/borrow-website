import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';
import CustomButton from '../common/CustomButton';

export const TransactionDrawer = ({ open, onClose, transaction, onReturn }) => {
  if (!transaction) return null;

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
      {/* Header */}
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
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            Transaction Audit Record
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            ID: {transaction.id || transaction.transactionId}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Status Header Bar */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            backgroundColor: '#F8FAFC',
            border: `1px solid ${BORROW_COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
              TRANSACTION STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <StatusChip status={transaction.computedStatus || transaction.status} />
              {transaction.condition && (
                <Chip label={`Condition: ${transaction.condition}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
              )}
            </Box>
          </Box>

          {(transaction.computedStatus === 'Issued' || transaction.computedStatus === 'Overdue') && (
            <CustomButton
              variant="contained"
              color="success"
              size="small"
              startIcon={<AssignmentReturnedIcon />}
              onClick={() => {
                onClose();
                onReturn(transaction);
              }}
            >
              Mark Returned
            </CustomButton>
          )}
        </Box>

        {/* Student Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1.5, letterSpacing: 0.5 }}>
            STUDENT BORROWER DETAILS
          </Typography>

          <Box
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar
              src={transaction.studentAvatar || ''}
              alt={transaction.studentName}
              sx={{ width: 52, height: 52, bgcolor: BORROW_COLORS.primary, fontWeight: 700 }}
            >
              {transaction.studentName[0]}
            </Avatar>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                {transaction.studentName}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>
                Reg No: {transaction.registerNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.25 }}>
                {transaction.department || 'Computer Science'} • {transaction.year || '3rd Year'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Book & Physical Copy Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1.5, letterSpacing: 0.5 }}>
            BOOK & PHYSICAL COPY TRACKING
          </Typography>

          <Box
            sx={{
              p: 2.5,
              borderRadius: '16px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: BORROW_COLORS.surface,
              display: 'flex',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 110,
                borderRadius: '8px',
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
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                {transaction.bookTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                By {transaction.bookAuthor}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 800, display: 'block' }}>
                PHYSICAL COPY ID: {transaction.bookCopyId}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Key Timestamps Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>CHECKOUT ISSUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {transaction.issueDate ? format(new Date(transaction.issueDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>RETURN DUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: transaction.isOverdue ? BORROW_COLORS.error : BORROW_COLORS.primary }}>
              {transaction.dueDate ? format(new Date(transaction.dueDate), 'dd MMM yyyy') : 'N/A'}
            </Typography>
          </Grid>
          {transaction.returnDate && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>ACTUAL RETURN DATE</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.success }}>
                {format(new Date(transaction.returnDate), 'dd MMM yyyy, hh:mm a')} (Processed by {transaction.returnedBy || 'Admin'})
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Notes */}
        {transaction.notes && (
          <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary }}>
              LIBRARIAN NOTES
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5, lineHeight: 1.6 }}>
              {transaction.notes}
            </Typography>
          </Box>
        )}

        {/* Timeline History */}
        {transaction.history?.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1, display: 'block' }}>
              TRANSACTION HISTORY LOG
            </Typography>
            <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
              {transaction.history.map((hist, idx) => (
                <Box key={idx} sx={{ mb: idx === transaction.history.length - 1 ? 0 : 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                    {hist.event}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    {format(new Date(hist.timestamp), 'dd MMM yyyy, hh:mm a')} • {hist.actor}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default TransactionDrawer;
