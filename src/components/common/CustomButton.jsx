import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';

const MotionButton = motion.create(Button);

export const CustomButton = ({
  children,
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'contained' | 'outlined' | 'text'
  color = 'primary',
  startIcon,
  endIcon,
  disabled,
  size = 'medium',
  sx = {},
  ...props
}) => {
  // Determine Button Hierarchy Styles
  let muiVariant = 'contained';
  let customStyles = {};

  if (variant === 'primary' || (variant === 'contained' && color === 'primary')) {
    muiVariant = 'contained';
    customStyles = {
      backgroundColor: BORROW_COLORS.primary,
      color: '#FFFFFF',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: BORROW_COLORS.primaryDark,
        boxShadow: 'none',
      },
    };
  } else if (variant === 'secondary') {
    muiVariant = 'contained';
    customStyles = {
      backgroundColor: '#F1F5F9',
      color: BORROW_COLORS.textPrimary,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#E2E8F0',
        boxShadow: 'none',
      },
    };
  } else if (variant === 'outline' || variant === 'outlined') {
    muiVariant = 'outlined';
    customStyles = {
      backgroundColor: 'transparent',
      borderColor: BORROW_COLORS.border,
      color: BORROW_COLORS.textPrimary,
      boxShadow: 'none',
      '&:hover': {
        borderColor: BORROW_COLORS.textMuted,
        backgroundColor: BORROW_COLORS.background,
        boxShadow: 'none',
      },
    };
  } else if (variant === 'danger') {
    muiVariant = 'contained';
    customStyles = {
      backgroundColor: BORROW_COLORS.error,
      color: '#FFFFFF',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#B91C1C',
        boxShadow: 'none',
      },
    };
  } else if (variant === 'ghost' || variant === 'text') {
    muiVariant = 'text';
    customStyles = {
      backgroundColor: 'transparent',
      color: BORROW_COLORS.textSecondary,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: '#F1F5F9',
        color: BORROW_COLORS.textPrimary,
      },
    };
  }

  return (
    <MotionButton
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      variant={muiVariant}
      disabled={disabled || loading}
      size={size}
      startIcon={!loading ? startIcon : null}
      endIcon={!loading ? endIcon : null}
      sx={{
        fontWeight: 500,
        borderRadius: '8px',
        px: size === 'small' ? 1.5 : size === 'large' ? 2.5 : 2,
        py: size === 'small' ? 0.5 : size === 'large' ? 1.25 : 0.85,
        fontSize: size === 'small' ? '0.8125rem' : '0.875rem',
        textTransform: 'none',
        ...customStyles,
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            color: (variant === 'primary' || variant === 'danger') ? '#FFFFFF' : BORROW_COLORS.primary,
            mr: 1,
          }}
        />
      )}
      {children}
    </MotionButton>
  );
};

export default CustomButton;
