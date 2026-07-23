import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI Error caught by Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F8FAFC',
            p: 3,
          }}
        >
          <Card
            sx={{
              maxWidth: 540,
              width: '100%',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
              border: `2px solid ${BORROW_COLORS.border}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                backgroundColor: '#FEF2F2',
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: `1px solid ${BORROW_COLORS.errorLight}`,
              }}
            >
              <ReportProblemIcon sx={{ fontSize: 44, color: BORROW_COLORS.error }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.error }}>
                  System Recovery Mode
                </Typography>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
                  An unhandled exception occurred in the application view.
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Typography variant="body1" sx={{ color: BORROW_COLORS.textPrimary, fontWeight: 700, mb: 1 }}>
                Error Details:
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  mb: 3,
                  maxHeight: 140,
                  overflowY: 'auto',
                }}
              >
                {this.state.error?.toString() || 'Unknown UI Error'}
              </Box>

              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 3 }}>
                You can attempt to recover by retrying the action, refreshing the page, or returning to the main dashboard.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  sx={{ borderRadius: '12px', background: BORROW_COLORS.primaryGradient }}
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleReload}
                  sx={{ borderRadius: '12px', borderColor: BORROW_COLORS.border, color: BORROW_COLORS.textPrimary }}
                >
                  Reload Application
                </Button>
                <Button
                  variant="text"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                  sx={{ borderRadius: '12px', color: BORROW_COLORS.primary }}
                >
                  Return Home
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
