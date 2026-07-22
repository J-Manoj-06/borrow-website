import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { RETURN_CONDITIONS } from '../../models/transactionModel';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';

export const ReturnDialog = ({ open, onClose, transaction, onConfirm }) => {
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!transaction) return null;

  const handleReturnSubmit = async () => {
    setSubmitting(true);
    try {
      await onConfirm(transaction.id || transaction.transactionId, condition, notes);
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
      title="Mark Book as Returned"
      subtitle="Verify physical condition, check book into inventory, and update transaction status."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose} disabled={submitting}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="success"
            loading={submitting}
            onClick={handleReturnSubmit}
            startIcon={<AssignmentReturnedIcon />}
          >
            Confirm Return Receipt
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        {/* Transaction Summary Card */}
        <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#ECFDF5', border: `1px solid ${BORROW_COLORS.successLight}` }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.success, fontWeight: 800 }}>
            RETURN RECEIPT PROCESSING
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
            {transaction.bookTitle}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
            Copy ID: <strong>{transaction.bookCopyId}</strong> &nbsp;|&nbsp; Student: <strong>{transaction.studentName}</strong> ({transaction.registerNumber})
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block', mt: 0.5 }}>
            Issued On: {transaction.issueDate ? format(new Date(transaction.issueDate), 'dd MMM yyyy') : 'N/A'} • Due: {transaction.dueDate ? format(new Date(transaction.dueDate), 'dd MMM yyyy') : 'N/A'}
          </Typography>
        </Box>

        {/* Condition Assessment Selector */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Returned Physical Condition *
          </Typography>
          <TextField
            select
            fullWidth
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            {RETURN_CONDITIONS.map((cond) => (
              <MenuItem key={cond.value} value={cond.value}>
                {cond.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Return Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Return Inspection Notes (Optional)"
          placeholder="e.g. Spine intact, no missing pages, checked into Shelf CS-04..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Box>
    </CustomDialog>
  );
};

export default ReturnDialog;
