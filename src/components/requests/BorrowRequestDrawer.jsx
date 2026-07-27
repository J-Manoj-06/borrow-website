import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';
import RequestLifecycleTimeline from './RequestLifecycleTimeline';

export const BorrowRequestDrawer = ({ open, onClose, request, onApprove, onReject }) => {
  if (!request) return null;

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
            Borrow Request Details
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
            ID: {request.id || request.requestId}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: BORROW_COLORS.textMuted }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Main Drawer Body */}
      <Box sx={{ p: 2.5, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Status & Quick Approval Header Bar */}
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
              CURRENT STATUS
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <StatusBadge status={request.status || 'Pending'} size="small" />
              <StatusBadge status={request.priority || 'Normal'} size="small" />
            </Box>
          </Box>

          {request.status === 'Pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <CustomButton
                variant="primary"
                size="small"
                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  onClose();
                  onApprove(request);
                }}
                sx={{ backgroundColor: BORROW_COLORS.success, '&:hover': { backgroundColor: '#15803D' } }}
              >
                Approve
              </CustomButton>

              <CustomButton
                variant="danger"
                size="small"
                startIcon={<HighlightOffIcon sx={{ fontSize: 16 }} />}
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

        {/* Lifecycle Step Timeline Visualizer */}
        <RequestLifecycleTimeline request={request} />

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
              src={request.studentAvatar || ''}
              alt={request.studentName}
              sx={{ width: 44, height: 44, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '1rem' }}
            >
              {(request.studentName || 'S')[0]}
            </Avatar>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                {request.studentName}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                Reg No: {request.registerNumber}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                {request.department || 'Computer Science'} • Year {request.year || '3'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Book Information */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block', letterSpacing: '0.05em' }}>
            REQUESTED BOOK
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
                src={request.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
                alt={request.bookTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>

            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, mb: 0.25 }}>
                {request.bookTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                By {request.bookAuthor || 'Unknown Author'}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>
                <strong>ISBN:</strong> {request.isbn}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>
                <strong>Copy ID:</strong> {request.bookCopyId || 'CPY-AUTO-ASSIGN'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Request Notes / Purpose */}
        {request.purpose && (
          <Box sx={{ p: 1.75, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.textMuted }}>
              PURPOSE OF BORROWING
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5, fontStyle: 'italic' }}>
              "{request.purpose}"
            </Typography>
          </Box>
        )}

        {/* Key Dates Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>REQUESTED DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {request.requestDate ? format(new Date(request.requestDate), 'dd MMM yyyy, hh:mm a') : 'Today'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>DUE DATE</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: request.dueDate ? BORROW_COLORS.primary : BORROW_COLORS.textMuted }}>
              {request.dueDate ? format(new Date(request.dueDate), 'dd MMM yyyy') : 'Pending Approval'}
            </Typography>
          </Grid>
        </Grid>

        {/* Rejection Reason if applicable */}
        {request.rejectionReason && (
          <Box sx={{ p: 1.75, borderRadius: '8px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 700 }}>
              REJECTION REASON
            </Typography>
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
              {request.rejectionReason}
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default BorrowRequestDrawer;
