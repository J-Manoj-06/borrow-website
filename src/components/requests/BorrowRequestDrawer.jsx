import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';
import CustomButton from '../common/CustomButton';

export const BorrowRequestDrawer = ({ open, onClose, request, onApprove, onReject }) => {
  if (!request) return null;

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
            Borrow Request Details
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            ID: {request.id || request.requestId}
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
              CURRENT STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <StatusChip status={request.status} />
              {request.priority && (
                <Chip
                  label={`${request.priority} Priority`}
                  size="small"
                  color={request.priority === 'High' ? 'warning' : 'default'}
                  sx={{ fontWeight: 700, fontSize: '0.725rem' }}
                />
              )}
            </Box>
          </Box>

          {request.status === 'Pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CustomButton
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={() => {
                  onClose();
                  onApprove(request);
                }}
              >
                Approve
              </CustomButton>

              <CustomButton
                variant="outlined"
                color="error"
                size="small"
                startIcon={<HighlightOffIcon />}
                onClick={() => {
                  onClose();
                  onReject(request);
                }}
              >
                Decline
              </CustomButton>
            </Box>
          )}
        </Box>

        {/* Student Information Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1.5, letterSpacing: 0.5 }}>
            STUDENT INFORMATION
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
              src={request.studentAvatar || ''}
              alt={request.studentName}
              sx={{ width: 56, height: 56, bgcolor: BORROW_COLORS.primary, fontWeight: 700, fontSize: '1.25rem' }}
            >
              {request.studentName[0]}
            </Avatar>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                {request.studentName}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>
                Reg No: {request.registerNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.25 }}>
                {request.department || 'Computer Science'} • {request.year || '3rd Year'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Book Information Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1.5, letterSpacing: 0.5 }}>
            REQUESTED BOOK CATALOG ENTRY
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
                width: 90,
                height: 125,
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                border: `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: '#F1F5F9',
              }}
            >
              <img
                src={request.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                alt={request.bookTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                {request.bookTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                By {request.bookAuthor}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                <strong>ISBN:</strong> {request.isbn}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                <strong>Target Copy ID:</strong> {request.bookCopyId || 'CPY-AUTO-ASSIGN'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Request Purpose Statement */}
        {request.purpose && (
          <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary }}>
              PURPOSE OF BORROWING
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5, fontStyle: 'italic', lineHeight: 1.6 }}>
              "{request.purpose}"
            </Typography>
          </Box>
        )}

        {/* Dates & Timeline */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>REQUESTED DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {request.requestDate ? format(new Date(request.requestDate), 'dd MMM yyyy, hh:mm a') : 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>DUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: request.dueDate ? BORROW_COLORS.primary : BORROW_COLORS.textSecondary }}>
              {request.dueDate ? format(new Date(request.dueDate), 'dd MMM yyyy') : 'Pending Approval'}
            </Typography>
          </Grid>
        </Grid>

        {request.rejectionReason && (
          <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 800 }}>
              REJECTION REASON
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
              {request.rejectionReason}
            </Typography>
          </Box>
        )}

        {/* History Timeline Logs */}
        {request.history?.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 1, display: 'block' }}>
              AUDIT HISTORY LOGS
            </Typography>

            <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
              {request.history.map((hist, idx) => (
                <Box key={idx} sx={{ mb: idx === request.history.length - 1 ? 0 : 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                    {hist.event}
                  </Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                    {format(new Date(hist.timestamp), 'dd MMM, hh:mm a')} • By {hist.actor}
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

export default BorrowRequestDrawer;
