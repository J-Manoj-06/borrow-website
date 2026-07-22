import React, { useState } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { useAuth } from '../../hooks/useAuth';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export const TopBar = ({ onMobileDrawerToggle }) => {
  const { user, logout } = useAuth();
  const { openCommandPalette } = useGlobalSearch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
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
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, height: 72 }}>
        {/* Left Side: Mobile Menu Toggle & Global Command Palette Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMobileDrawerToggle}
            sx={{ display: { lg: 'none' }, color: BORROW_COLORS.textPrimary }}
          >
            <MenuIcon />
          </IconButton>

          {/* Top Bar Quick Search Input Trigger */}
          <Box
            onClick={openCommandPalette}
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              border: `1px solid ${BORROW_COLORS.border}`,
              borderRadius: '12px',
              px: 2,
              py: 0.8,
              width: { xs: 180, sm: 300, md: 380 },
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#F1F5F9',
                borderColor: BORROW_COLORS.primary,
              },
            }}
          >
            <SearchIcon sx={{ color: BORROW_COLORS.primary, mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, flexGrow: 1, fontWeight: 500 }} noWrap>
              Search anything (Press Ctrl + K)...
            </Typography>
            <Chip
              label="Ctrl+K"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.675rem',
                fontWeight: 800,
                backgroundColor: BORROW_COLORS.surface,
                color: BORROW_COLORS.textSecondary,
                border: `1px solid ${BORROW_COLORS.border}`,
              }}
            />
          </Box>
        </Box>

        {/* Right Side: Notifications & Librarian User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notifications Trigger */}
          <Tooltip title="View Notifications & Announcements">
            <IconButton onClick={() => navigate(ROUTES.NOTIFICATIONS)} sx={{ color: BORROW_COLORS.textSecondary }}>
              <Badge badgeContent={3} color="primary">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Librarian Profile Menu Button */}
          <Box
            onClick={handleProfileMenuOpen}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 0.75,
              px: 1.25,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#F8FAFC',
              },
            }}
          >
            <Avatar
              src={user?.photoURL || ''}
              alt={user?.displayName || 'Librarian'}
              sx={{
                width: 38,
                height: 38,
                bgcolor: BORROW_COLORS.primary,
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {userInitial}
            </Avatar>

            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, color: BORROW_COLORS.textPrimary }}>
                {user?.displayName || 'Lead Librarian'}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                Admin Portal
              </Typography>
            </Box>
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            PaperProps={{
              elevation: 4,
              sx: {
                width: 220,
                mt: 1.5,
                borderRadius: '14px',
                border: `1px solid ${BORROW_COLORS.border}`,
                boxShadow: BORROW_COLORS.cardShadow,
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
                {user?.displayName || 'Librarian Admin'}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }} noWrap>
                {user?.email || 'admin@borrow.com'}
              </Typography>
            </Box>
            <Divider />

            <MenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
              <ListItemIcon>
                <AccountCircleOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Profile & Account
            </MenuItem>

            <MenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              System Settings
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ color: BORROW_COLORS.error }}>
              <ListItemIcon sx={{ color: BORROW_COLORS.error }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Log Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
