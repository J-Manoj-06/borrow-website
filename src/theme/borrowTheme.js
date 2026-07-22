import { createTheme } from '@mui/material/styles';

// Borrow Brand Colors
export const BORROW_COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryGradient: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  primaryGradientHover: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#22C55E',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  cardShadow: '0px 4px 20px rgba(15, 23, 42, 0.05)',
  cardShadowHover: '0px 8px 30px rgba(37, 99, 235, 0.12)',
};

const borrowTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BORROW_COLORS.primary,
      light: BORROW_COLORS.primaryLight,
      dark: BORROW_COLORS.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: BORROW_COLORS.textSecondary,
    },
    background: {
      default: BORROW_COLORS.background,
      paper: BORROW_COLORS.surface,
    },
    text: {
      primary: BORROW_COLORS.textPrimary,
      secondary: BORROW_COLORS.textSecondary,
    },
    divider: BORROW_COLORS.border,
    success: {
      main: BORROW_COLORS.success,
      light: BORROW_COLORS.successLight,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: BORROW_COLORS.warning,
      light: BORROW_COLORS.warningLight,
      contrastText: '#FFFFFF',
    },
    error: {
      main: BORROW_COLORS.error,
      light: BORROW_COLORS.errorLight,
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      color: BORROW_COLORS.textPrimary,
      fontSize: '2.25rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.875rem',
      lineHeight: 1.25,
    },
    h3: {
      fontWeight: 700,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.25rem',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1rem',
      lineHeight: 1.45,
    },
    subtitle1: {
      fontSize: '0.95rem',
      color: BORROW_COLORS.textSecondary,
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.85rem',
      color: BORROW_COLORS.textSecondary,
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.95rem',
      color: BORROW_COLORS.textPrimary,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      color: BORROW_COLORS.textSecondary,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.04)',
    '0px 2px 4px rgba(15, 23, 42, 0.04)',
    '0px 4px 8px rgba(15, 23, 42, 0.05)',
    BORROW_COLORS.cardShadow,
    '0px 6px 24px rgba(15, 23, 42, 0.08)',
    BORROW_COLORS.cardShadowHover,
    ...Array(18).fill('0px 8px 30px rgba(15, 23, 42, 0.1)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: BORROW_COLORS.background,
          color: BORROW_COLORS.textPrimary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: BORROW_COLORS.cardShadow,
          border: `1px solid ${BORROW_COLORS.border}`,
          backgroundImage: 'none',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: BORROW_COLORS.cardShadowHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.25)',
          },
        },
        containedPrimary: {
          background: BORROW_COLORS.primaryGradient,
          color: '#FFFFFF',
          '&:hover': {
            background: BORROW_COLORS.primaryGradientHover,
          },
        },
        outlinedPrimary: {
          borderColor: BORROW_COLORS.border,
          color: BORROW_COLORS.primary,
          '&:hover': {
            borderColor: BORROW_COLORS.primary,
            backgroundColor: 'rgba(37, 99, 235, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${BORROW_COLORS.border}`,
          backgroundColor: BORROW_COLORS.surface,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: BORROW_COLORS.surface,
          color: BORROW_COLORS.textPrimary,
          boxShadow: 'none',
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: BORROW_COLORS.textSecondary,
          backgroundColor: '#F1F5F9',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
        body: {
          fontSize: '0.875rem',
          color: BORROW_COLORS.textPrimary,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '& fieldset': {
              borderColor: BORROW_COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: BORROW_COLORS.primaryLight,
            },
            '&.Mui-focused fieldset': {
              borderColor: BORROW_COLORS.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
});

export default borrowTheme;
