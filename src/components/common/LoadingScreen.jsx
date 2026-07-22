import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const LoadingScreen = ({ message = 'Loading Borrow Admin Portal...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BORROW_COLORS.background,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <CircularProgress
          size={64}
          thickness={3.5}
          sx={{
            color: BORROW_COLORS.primary,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: BORROW_COLORS.primaryLight,
            opacity: 0.8,
          }}
        />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
        Borrow Admin
      </Typography>
      <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary }}>
        {message}
      </Typography>
    </Box>
  );
};

export const SkeletonDashboard = () => {
  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item}>
            <Card sx={{ p: 1 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="rectangular" width="40%" height={40} sx={{ my: 1.5, borderRadius: 2 }} />
                <Skeleton variant="text" width="80%" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" width="100%" height={320} sx={{ borderRadius: 4 }} />
    </Box>
  );
};

export default LoadingScreen;
