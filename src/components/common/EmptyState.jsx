import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomButton from './CustomButton';

// SVG Vector Illustrations for Empty States
const Illustrations = {
  books: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" fill="#EFF6FF" />
      <path d="M45 42H85C89.4183 42 93 45.5817 93 50V98C93 102.418 89.4183 106 85 106H45V42Z" fill="#DBEAFE" />
      <path d="M45 42H83C87.4183 42 91 45.5817 91 50V96C91 100.418 87.4183 104 83 104H45V42Z" fill="#3B82F6" opacity="0.15" />
      <rect x="40" y="38" width="12" height="68" rx="3" fill="#2563EB" />
      <line x1="58" y1="56" x2="80" y2="56" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="68" x2="75" y2="68" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
      <line x1="58" y1="80" x2="78" y2="80" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  requests: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" fill="#FEF3C7" opacity="0.6" />
      <rect x="42" y="42" width="56" height="60" rx="10" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />
      <path d="M52 58H88" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 70H80" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <path d="M52 82H72" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="85" cy="85" r="16" fill="#F59E0B" />
      <path d="M80 85L83.5 88.5L90 82" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  activity: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" fill="#F1F5F9" />
      <path d="M45 80L58 65L72 75L95 48" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="95" cy="48" r="6" fill="#2563EB" />
      <line x1="40" y1="95" x2="100" y2="95" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  students: (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="70" cy="70" r="60" fill="#DCFCE7" opacity="0.6" />
      <circle cx="70" cy="55" r="18" fill="#22C55E" opacity="0.2" />
      <path d="M45 92C45 78.7452 55.7452 68 69 68H71C84.2548 68 95 78.7452 95 92V96H45V92Z" fill="#22C55E" opacity="0.2" />
      <circle cx="70" cy="55" r="14" fill="#22C55E" />
      <path d="M50 92C50 82 59 74 70 74C81 74 90 82 90 92V94H50V92Z" fill="#22C55E" />
    </svg>
  ),
};

export const EmptyState = ({
  type = 'books',
  title = 'No Data Found',
  description = 'There are currently no items available in this view.',
  actionLabel,
  onAction,
  icon,
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
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ mb: 2.5 }}>{graphic}</Box>
      </motion.div>

      <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 1 }}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: BORROW_COLORS.textSecondary,
          maxWidth: 420,
          mb: actionLabel ? 3 : 0,
          lineHeight: 1.6,
        }}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <CustomButton variant="contained" color="primary" onClick={onAction}>
          {actionLabel}
        </CustomButton>
      )}
    </Box>
  );
};

export default EmptyState;
