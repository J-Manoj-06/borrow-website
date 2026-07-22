import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SecurityIcon from '@mui/icons-material/Security';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import PageContainer from './PageContainer';
import CustomButton from './CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { ROUTES } from '../../constants/routes';

export const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="Access Restricted">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: 440,
          p: 4,
          backgroundColor: BORROW_COLORS.surface,
          borderRadius: '24px',
          border: `1px solid ${BORROW_COLORS.border}`,
          boxShadow: BORROW_COLORS.cardShadow,
        }}
      >
        <Box
          sx={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: BORROW_COLORS.errorLight,
            color: BORROW_COLORS.error,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <SecurityIcon sx={{ fontSize: 48 }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 900, color: BORROW_COLORS.textPrimary, mb: 1 }}>
          403 - Access Denied
        </Typography>

        <Typography variant="body1" sx={{ color: BORROW_COLORS.textSecondary, maxWidth: 440, mb: 3.5, lineHeight: 1.6 }}>
          You do not possess the required administrator permissions to view or perform actions on this page. Please contact your Super Administrator.
        </Typography>

        <CustomButton
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate(ROUTES.DASHBOARD)}
        >
          Return to Dashboard
        </CustomButton>
      </Box>
    </PageContainer>
  );
};

export default AccessDenied;
