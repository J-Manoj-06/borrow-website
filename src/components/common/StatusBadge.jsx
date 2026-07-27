import React from 'react';
import Chip from '@mui/material/Chip';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const StatusBadge = ({ status, label, variant = 'soft', size = 'small', sx = {} }) => {
  const displayLabel = label || status;
  const normalized = String(status || '').toLowerCase().trim();

  let color = BORROW_COLORS.textSecondary;
  let bg = BORROW_COLORS.background;
  let border = BORROW_COLORS.border;

  if (['active', 'approved', 'available', 'returned', 'completed', 'success'].includes(normalized)) {
    color = BORROW_COLORS.success;
    bg = BORROW_COLORS.successLight;
    border = 'transparent';
  } else if (['pending', 'in progress', 'borrowed', 'issued', 'warning'].includes(normalized)) {
    color = BORROW_COLORS.warning;
    bg = BORROW_COLORS.warningLight;
    border = 'transparent';
  } else if (['overdue', 'rejected', 'cancelled', 'lost', 'failed', 'error'].includes(normalized)) {
    color = BORROW_COLORS.error;
    bg = BORROW_COLORS.errorLight;
    border = 'transparent';
  } else if (['info', 'primary'].includes(normalized)) {
    color = BORROW_COLORS.primary;
    bg = BORROW_COLORS.primarySurface;
    border = 'transparent';
  }

  return (
    <Chip
      label={displayLabel}
      size={size}
      aria-label={`Status: ${displayLabel}`}
      sx={{
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontWeight: 600,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        px: 0.5,
        height: size === 'small' ? 24 : 28,
        ...sx,
      }}
    />
  );
};

export default StatusBadge;
