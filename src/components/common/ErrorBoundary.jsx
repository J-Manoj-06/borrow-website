import React, { Component } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomButton from './CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Application Runtime Exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            backgroundColor: '#F8FAFC',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              p: 4,
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
              border: `1px solid ${BORROW_COLORS.border}`,
              maxWidth: 480,
              width: '100%',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 64, color: BORROW_COLORS.error, mb: 1.5 }} />

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: BORROW_COLORS.textPrimary }}>
              Something Went Wrong
            </Typography>

            <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 3, lineHeight: 1.6 }}>
              An unexpected runtime error occurred. Our system telemetry has logged the issue for review.
            </Typography>

            <CustomButton variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReload}>
              Reload Application
            </CustomButton>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
