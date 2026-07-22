import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import toast from 'react-hot-toast';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const AppearanceSettings = () => {
  const [mode, setMode] = useState('light');

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    toast.success(`Appearance theme set to ${newMode} mode!`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Appearance & Theme Customization
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Select color theme preferences for the Borrow Library Admin Portal interface.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={4}>
          <Box
            onClick={() => handleSelectMode('light')}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${mode === 'light' ? BORROW_COLORS.primary : '#E2E8F0'}`,
              backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            <WbSunnyIcon sx={{ fontSize: 40, color: '#F59E0B' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Light Theme
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Clean crisp white surface background
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            onClick={() => handleSelectMode('dark')}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${mode === 'dark' ? BORROW_COLORS.primary : '#E2E8F0'}`,
              backgroundColor: mode === 'dark' ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            <NightlightIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Dark Mode
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Sleek dark contrast surface layout
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Box
            onClick={() => handleSelectMode('system')}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `2px solid ${mode === 'system' ? BORROW_COLORS.primary : '#E2E8F0'}`,
              backgroundColor: mode === 'system' ? 'rgba(37, 99, 235, 0.04)' : '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.5,
              transition: 'all 0.2s ease',
            }}
          >
            <SettingsBrightnessIcon sx={{ fontSize: 40, color: BORROW_COLORS.primary }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                System Default
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Matches operating system preference
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AppearanceSettings;
