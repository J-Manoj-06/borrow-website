import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { motion } from 'framer-motion';
import { BORROW_COLORS } from '../../theme/borrowTheme';

const MotionButton = motion.create(Button);

export const CustomButton = ({
  children,
  loading = false,
  variant = 'contained',
  color = 'primary',
  startIcon,
  endIcon,
  disabled,
  sx = {},
  gradient = false,
  ...props
}) => {
  const gradientStyles = gradient || (variant === 'contained' && color === 'primary')
    ? {
        background: BORROW_COLORS.primaryGradient,
        color: '#FFFFFF',
        '&:hover': {
          background: BORROW_COLORS.primaryGradientHover,
        },
      }
    : {};

  return (
    <MotionButton
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      variant={variant}
      color={color}
      disabled={disabled || loading}
      startIcon={!loading ? startIcon : null}
      endIcon={!loading ? endIcon : null}
      sx={{
        position: 'relative',
        fontWeight: 600,
        borderRadius: '10px',
        px: 3,
        py: 1.25,
        boxShadow: variant === 'contained' ? '0px 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
        ...gradientStyles,
        ...sx,
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: variant === 'contained' ? '#FFFFFF' : BORROW_COLORS.primary,
            mr: 1,
          }}
        />
      )}
      {children}
    </MotionButton>
  );
};

export default CustomButton;
