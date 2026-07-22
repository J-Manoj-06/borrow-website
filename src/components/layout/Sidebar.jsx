import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { motion } from 'framer-motion';
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useAuth } from '../../hooks/useAuth';

export const SIDEBAR_WIDTH = 265;

const MotionListItemButton = motion.create(ListItemButton);

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) onMobileClose();
  };

  const handleLogoutClick = async () => {
    if (mobileOpen) onMobileClose();
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: BORROW_COLORS.surface,
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: BORROW_COLORS.primaryGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, lineHeight: 1.1 }}>
            Borrow
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, letterSpacing: 0.5 }}>
            ADMIN PORTAL
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, py: 2, px: 2, overflowY: 'auto' }}>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            mb: 1,
            display: 'block',
            fontWeight: 700,
            color: BORROW_COLORS.textSecondary,
            letterSpacing: 1,
          }}
        >
          MAIN MENU
        </Typography>

        <List disablePadding>
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.75 }}>
                <MotionListItemButton
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.path)}
                  sx={{
                    borderRadius: '12px',
                    py: 1.25,
                    px: 2,
                    position: 'relative',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textSecondary,
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'rgba(15, 23, 42, 0.04)',
                      color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textPrimary,
                    },
                  }}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: '15%',
                        height: '70%',
                        width: 4,
                        borderRadius: '0 4px 4px 0',
                        background: BORROW_COLORS.primaryGradient,
                      }}
                    />
                  )}

                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textSecondary,
                    }}
                  >
                    {item.badgeKey ? (
                      <Badge badgeContent={3} color="primary">
                        <IconComponent />
                      </Badge>
                    ) : (
                      <IconComponent />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.925rem',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  />
                </MotionListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Info & Logout Footer */}
      <Box
        sx={{
          p: 2,
          m: 2,
          borderRadius: '16px',
          backgroundColor: '#F8FAFC',
          border: `1px solid ${BORROW_COLORS.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Avatar
            src={user?.photoURL || ''}
            alt={user?.displayName || 'Admin'}
            sx={{ width: 40, height: 40, bgcolor: BORROW_COLORS.primary, fontWeight: 700 }}
          >
            {(user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {user?.displayName || 'Lead Librarian'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.primary, fontWeight: 600 }}>
              {role || 'Admin'}
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={handleLogoutClick}
          sx={{
            borderRadius: '10px',
            py: 1,
            px: 1.5,
            color: BORROW_COLORS.error,
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: BORROW_COLORS.error }}>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Logout Session"
            primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { lg: SIDEBAR_WIDTH }, flexShrink: { lg: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Desktop Permanent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: SIDEBAR_WIDTH },
        }}
        open
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
