import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar, { SIDEBAR_WIDTH } from './Sidebar';
import TopBar from './TopBar';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: BORROW_COLORS.background }}>
      {/* Navigation Sidebar Drawer */}
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      {/* Main Content Column */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BORROW_COLORS.background,
        }}
      >
        {/* Top Application Bar inside main column */}
        <TopBar onMobileDrawerToggle={handleDrawerToggle} />

        {/* Page Content View */}
        <Box sx={{ flexGrow: 1, pb: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
