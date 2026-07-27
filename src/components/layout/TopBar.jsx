import React, { useState } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SpeedIcon from '@mui/icons-material/Speed';

import { useAuth } from '../../hooks/useAuth';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import HealthDashboardModal from '../common/HealthDashboardModal';
import UniversalSearchBar from '../common/UniversalSearchBar';

export const TopBar = ({ onMobileDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { openCommandPalette } = useGlobalSearch();
  const { unreadCount } = useUnreadNotifications();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const openMenu = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
  };

  const userInitial = user?.displayName ? user.displayName[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : 'L';

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: BORROW_COLORS.surface,
          color: BORROW_COLORS.textPrimary,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, height: 60, minHeight: '60px !important' }}>
          {/* Left Side: Mobile Menu Toggle & Universal Search Bar Trigger */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileDrawerToggle}
              sx={{ display: { lg: 'none' }, color: BORROW_COLORS.textPrimary, p: 0.75 }}
            >
              <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Universal Search Bar Trigger */}
            <UniversalSearchBar
              placeholder="Search anything (Press Ctrl + K)..."
              shortcutHint="Ctrl + K"
              onClick={openCommandPalette}
              width={{ xs: 180, sm: 280, md: 360 }}
            />
          </Box>

          {/* Right Side: System Diagnostics, Notifications & Profile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* System Health Trigger */}
            <Tooltip title="System Health & Diagnostics">
              <IconButton size="small" onClick={() => setHealthModalOpen(true)} sx={{ color: BORROW_COLORS.primary, p: 1 }}>
                <SpeedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Notifications Trigger */}
            <Tooltip title="Notifications">
              <IconButton size="small" onClick={() => navigate(ROUTES.NOTIFICATIONS)} sx={{ color: BORROW_COLORS.textSecondary, p: 1 }}>
                {unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                    <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
                  </Badge>
                ) : (
                  <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>

            {/* User Profile Menu Button */}
            <Box
              onClick={handleProfileMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.5,
                px: 1,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  backgroundColor: BORROW_COLORS.background,
                },
              }}
            >
              <Avatar
                src={user?.photoURL || ''}
                alt={user?.displayName || 'Librarian'}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: BORROW_COLORS.primary,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                {userInitial}
              </Avatar>

              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', lineHeight: 1.2, color: BORROW_COLORS.textPrimary }}>
                  {user?.displayName || 'Lead Librarian'}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontSize: '0.71875rem', display: 'block' }}>
                  Admin Portal
                </Typography>
              </Box>
            </Box>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleProfileMenuClose}
              onClick={handleProfileMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  width: 200,
                  mt: 1,
                  borderRadius: '8px',
                  border: `1px solid ${BORROW_COLORS.border}`,
                  boxShadow: BORROW_COLORS.cardShadow,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: BORROW_COLORS.textPrimary }}>
                  {user?.displayName || 'Librarian Admin'}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontSize: '0.71875rem' }} noWrap>
                  {user?.email || 'admin@borrow.com'}
                </Typography>
              </Box>
              <Divider />

              <MenuItem onClick={() => setHealthModalOpen(true)} sx={{ fontSize: '0.8125rem' }}>
                <ListItemIcon>
                  <SpeedIcon fontSize="small" sx={{ color: BORROW_COLORS.primary }} />
                </ListItemIcon>
                System Health
              </MenuItem>

              <MenuItem onClick={() => navigate(ROUTES.SETTINGS)} sx={{ fontSize: '0.8125rem' }}>
                <ListItemIcon>
                  <AccountCircleOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Profile & Account
              </MenuItem>

              <MenuItem onClick={() => navigate(ROUTES.SETTINGS)} sx={{ fontSize: '0.8125rem' }}>
                <ListItemIcon>
                  <SettingsOutlinedIcon fontSize="small" />
                </ListItemIcon>
                System Settings
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout} sx={{ color: BORROW_COLORS.error, fontSize: '0.8125rem' }}>
                <ListItemIcon sx={{ color: BORROW_COLORS.error }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* System Health Modal */}
      <HealthDashboardModal open={healthModalOpen} onClose={() => setHealthModalOpen(false)} />
    </>
  );
};

export default TopBar;
