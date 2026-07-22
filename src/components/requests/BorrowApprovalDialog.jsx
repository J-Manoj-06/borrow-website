import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Card from '@mui/material/Card';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { LOAN_DURATIONS } from '../../models/borrowRequestModel';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';

export const BorrowApprovalDialog = ({ open, onClose, request, onConfirm }) => {
  const [selectedDuration, setSelectedDuration] = useState(14);
  const [customDate, setCustomDate] = useState(
    format(addDays(new Date(), 14), 'yyyy-MM-dd')
  );
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const calculateDueDate = () => {
    if (selectedDuration === 'custom') {
      return customDate ? new Date(customDate) : addDays(new Date(), 14);
    }
    return addDays(new Date(), Number(selectedDuration));
  };

  const dueDate = calculateDueDate();

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const finalDuration = selectedDuration === 'custom' ? customDate : Number(selectedDuration);
      await onConfirm(request.id || request.requestId, finalDuration);
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
      title="Approve Borrow Request"
      subtitle="Grant permission for the student to collect their requested book copy."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose} disabled={submitting}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="success"
            loading={submitting}
            onClick={handleApprove}
            startIcon={<EventAvailableIcon />}
          >
            Confirm Approval
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        {/* Summary Card */}
        <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 700 }}>
            REQUEST SUMMARY
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mt: 0.5 }}>
            {request.bookTitle}
          </Typography>
          <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
            Requested by: <strong>{request.studentName}</strong> ({request.registerNumber})
          </Typography>
        </Box>

        {/* Loan Duration Picker */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Select Authorized Loan Duration:
          </Typography>

          <RadioGroup
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value === 'custom' ? 'custom' : Number(e.target.value))}
          >
            {LOAN_DURATIONS.map((dur) => (
              <FormControlLabel
                key={dur.value}
                value={dur.value}
                control={<Radio size="small" color="primary" />}
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dur.label}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>
        </Box>

        {/* Custom Date Input */}
        {selectedDuration === 'custom' && (
          <TextField
            type="date"
            label="Custom Return Due Date"
            fullWidth
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}

        {/* Expected Due Date Preview Box */}
        <Card
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #ECFDF5 0%, #DCFCE7 100%)',
            border: `1px solid ${BORROW_COLORS.success}`,
          }}
        >
          <Typography variant="caption" sx={{ color: BORROW_COLORS.success, fontWeight: 800, letterSpacing: 0.5 }}>
            CALCULATED RETURN DUE DATE
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#065F46', mt: 0.5 }}>
            {format(dueDate, 'EEEE, dd MMMM yyyy')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#047857', display: 'block', mt: 0.5 }}>
            Student mobile app will be automatically updated with this return deadline.
          </Typography>
        </Card>
      </Box>
    </CustomDialog>
  );
};

export default BorrowApprovalDialog;
