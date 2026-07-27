import { createTheme } from '@mui/material/styles';

// Linear / Notion / Stripe style Borrow Design Tokens
export const BORROW_COLORS = {
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primarySurface: '#EFF6FF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#EA580C',
  warningLight: '#FFEDD5',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  cardShadow: '0px 1px 3px rgba(15, 23, 42, 0.05), 0px 1px 2px rgba(15, 23, 42, 0.04)',
  cardShadowHover: '0px 4px 12px rgba(15, 23, 42, 0.08)',
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
      disabled: BORROW_COLORS.textMuted,
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
      fontWeight: 700,
      color: BORROW_COLORS.textPrimary,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.25rem',
      lineHeight: 1.35,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '1rem',
      lineHeight: 1.45,
    },
    h6: {
      fontWeight: 600,
      color: BORROW_COLORS.textPrimary,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '0.875rem',
      color: BORROW_COLORS.textSecondary,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.8125rem',
      color: BORROW_COLORS.textSecondary,
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      color: BORROW_COLORS.textPrimary,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.8125rem',
      color: BORROW_COLORS.textSecondary,
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      color: BORROW_COLORS.textMuted,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(15, 23, 42, 0.04)',
    '0px 1px 3px rgba(15, 23, 42, 0.05), 0px 1px 2px rgba(15, 23, 42, 0.04)',
    '0px 4px 6px -1px rgba(15, 23, 42, 0.05), 0px 2px 4px -1px rgba(15, 23, 42, 0.03)',
    BORROW_COLORS.cardShadow,
    '0px 10px 15px -3px rgba(15, 23, 42, 0.05), 0px 4px 6px -2px rgba(15, 23, 42, 0.025)',
    BORROW_COLORS.cardShadowHover,
    ...Array(18).fill('0px 10px 15px -3px rgba(15, 23, 42, 0.05)'),
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
          borderRadius: 12,
          boxShadow: BORROW_COLORS.cardShadow,
          border: `1px solid ${BORROW_COLORS.border}`,
          backgroundImage: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '6px 14px',
          fontWeight: 500,
          boxShadow: 'none',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: BORROW_COLORS.primary,
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: BORROW_COLORS.primaryDark,
          },
        },
        outlinedPrimary: {
          borderColor: BORROW_COLORS.border,
          color: BORROW_COLORS.textPrimary,
          '&:hover': {
            borderColor: BORROW_COLORS.textMuted,
            backgroundColor: BORROW_COLORS.background,
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
          borderRadius: 12,
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
          fontWeight: 500,
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: BORROW_COLORS.textSecondary,
          backgroundColor: BORROW_COLORS.background,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
        },
        body: {
          fontSize: '0.8125rem',
          color: BORROW_COLORS.textPrimary,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            fontSize: '0.875rem',
            backgroundColor: BORROW_COLORS.surface,
            '& fieldset': {
              borderColor: BORROW_COLORS.border,
            },
            '&:hover fieldset': {
              borderColor: BORROW_COLORS.textMuted,
            },
            '&.Mui-focused fieldset': {
              borderColor: BORROW_COLORS.primary,
              borderWidth: 1.5,
            },
          },
        },
      },
    },
  },
});

export default borrowTheme;
