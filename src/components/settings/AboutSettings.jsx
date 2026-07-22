import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const AboutSettings = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          About Borrow Library Admin Portal
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          System information, software build versions, ecosystem architecture, and licensing.
        </Typography>
      </Box>

      {/* Hero Banner */}
      <Box
        sx={{
          p: 3,
          borderRadius: '20px',
          background: BORROW_COLORS.primaryGradient,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.25)',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            backgroundColor: '#FFFFFF',
            color: BORROW_COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.75rem',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
          }}
        >
          B
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF' }}>
              Borrow Admin Portal
            </Typography>
            <Chip label="v1.0.0 Production" size="small" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF', fontWeight: 800 }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Official University Library Management System • Flutter & Web Ecosystem
          </Typography>
        </Box>
      </Box>

      {/* System Telemetry Grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>WEB FRAMEWORK</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>React 19.0</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>BUILD BUNDLER</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>Vite 6.4</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>UI SYSTEM</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>Material UI 6 (M3)</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>DATABASE & AUTH</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>Firebase v11 SDK</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AboutSettings;
