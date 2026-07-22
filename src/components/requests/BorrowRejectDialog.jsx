import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { REJECTION_REASONS } from '../../models/borrowRequestModel';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';

export const BorrowRejectDialog = ({ open, onClose, request, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customNotes, setCustomNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const finalReason =
        selectedReason.startsWith('Other') && customNotes ? customNotes : selectedReason;
      await onConfirm(request.id || request.requestId, finalReason);
    } catch {
      // Handled by context toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Decline Borrow Request"
      subtitle="Reject the student's borrowing request and notify them with an explanation."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose} disabled={submitting}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="error"
            loading={submitting}
            onClick={handleReject}
            startIcon={<HighlightOffIcon />}
          >
            Confirm Rejection
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        {/* Request Banner */}
        <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 700 }}>
            DECLINING REQUEST
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
            {request.bookTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
            Student: <strong>{request.studentName}</strong> ({request.registerNumber})
          </Typography>
        </Box>

        {/* Reason Selector */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Select Rejection Reason *
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            {REJECTION_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Additional Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Additional Librarian Notes (Optional)"
          placeholder="Provide further context or instructions for the student..."
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
        />
      </Box>
    </CustomDialog>
  );
};

export default BorrowRejectDialog;
