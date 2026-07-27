import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomButton from './CustomButton';

// Minimalist vector illustrations for empty states
const Illustrations = {
  books: (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#EFF6FF" />
      <rect x="32" y="28" width="36" height="44" rx="4" fill="#3B82F6" opacity="0.2" />
      <rect x="28" y="32" width="36" height="44" rx="4" fill="#2563EB" opacity="0.8" />
      <line x1="36" y1="42" x2="52" y2="42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="50" x2="48" y2="50" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  requests: (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#FFEDD5" />
      <rect x="30" y="30" width="40" height="44" rx="6" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
      <line x1="38" y1="42" x2="62" y2="42" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="52" x2="54" y2="52" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="62" cy="62" r="10" fill="#EA580C" />
      <path d="M58 62L61 65L66 60" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  activity: (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#F1F5F9" />
      <path d="M32 58L42 46L52 52L68 34" stroke="#64748B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="68" cy="34" r="4" fill="#2563EB" />
    </svg>
  ),
  students: (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="44" fill="#DCFCE7" />
      <circle cx="50" cy="42" r="12" fill="#16A34A" opacity="0.3" />
      <path d="M32 70C32 60 40 54 50 54C60 54 68 60 68 70V72H32V70Z" fill="#16A34A" opacity="0.3" />
      <circle cx="50" cy="40" r="10" fill="#16A34A" />
      <path d="M35 68C35 60 42 54 50 54C58 54 65 60 65 68V70H35V68Z" fill="#16A34A" />
    </svg>
  ),
};

export const EmptyState = ({
  type = 'books',
  title = 'No Data Found',
  description = 'There are currently no items available matching your view criteria.',
  actionLabel,
  onAction,
  icon,
  sx = {},
}) => {
  const graphic = icon || Illustrations[type] || Illustrations.books;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 6,
        px: 3,
        width: '100%',
        ...sx,
      }}
    >
      <Box sx={{ mb: 2 }}>{graphic}</Box>

      <Typography variant="h4" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.75 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: BORROW_COLORS.textSecondary,
          maxWidth: 400,
          mb: actionLabel && onAction ? 3 : 0,
          lineHeight: 1.5,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <CustomButton variant="primary" onClick={onAction}>
          {actionLabel}
        </CustomButton>
      )}
    </Box>
  );
};

export default EmptyState;
