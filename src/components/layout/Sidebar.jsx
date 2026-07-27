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
import { NAVIGATION_ITEMS } from '../../constants/navigation';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useAuth } from '../../hooks/useAuth';
import { useRBAC } from '../../hooks/useRBAC';
import { usePendingBorrowRequests } from '../../hooks/usePendingBorrowRequests';
import { useUnreadNotifications } from '../../hooks/useUnreadNotifications';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../models/rbacModel';

export const SIDEBAR_WIDTH = 240;

const MODULE_MAP = {
  dashboard: PERMISSION_MODULES.DASHBOARD,
  books: PERMISSION_MODULES.BOOKS,
  requests: PERMISSION_MODULES.REQUESTS,
  returns: PERMISSION_MODULES.RETURNS,
  students: PERMISSION_MODULES.STUDENTS,
  scanner: PERMISSION_MODULES.SCANNER,
  notifications: PERMISSION_MODULES.NOTIFICATIONS,
  reports: PERMISSION_MODULES.REPORTS,
  activity: PERMISSION_MODULES.ACTIVITY,
  admins: PERMISSION_MODULES.ADMINS,
  settings: PERMISSION_MODULES.SETTINGS,
};

// Logical Menu Groupings
const NAV_GROUPS = [
  {
    title: 'OVERVIEW',
    itemIds: ['dashboard', 'reports'],
  },
  {
    title: 'MANAGEMENT',
    itemIds: ['books', 'requests', 'returns', 'students', 'scanner'],
  },
  {
    title: 'SYSTEM',
    itemIds: ['notifications', 'activity', 'admins', 'settings'],
  },
];

export const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, adminProfile, role, logout } = useAuth();
  const { hasPermission } = useRBAC();
  const { pendingCount } = usePendingBorrowRequests();
  const { unreadCount } = useUnreadNotifications();

  const handleNavClick = (path) => {
    navigate(path);
    if (mobileOpen) onMobileClose();
  };

  const handleLogoutClick = async () => {
    if (mobileOpen) onMobileClose();
    await logout();
    navigate('/login');
  };

  // Filter navigation items dynamically based on module view permissions
  const visibleNavItems = NAVIGATION_ITEMS.filter((item) => {
    const targetModule = MODULE_MAP[item.id];
    if (!targetModule) return true;
    return hasPermission(targetModule, PERMISSION_ACTIONS.VIEW);
  });

  const getBadgeValue = (id) => {
    if (id === 'requests') return pendingCount;
    if (id === 'notifications') return unreadCount;
    return 0;
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
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            backgroundColor: BORROW_COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <AutoStoriesIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, lineHeight: 1.1 }}>
            Borrow
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontWeight: 600, fontSize: '0.6875rem' }}>
            ADMIN PORTAL
          </Typography>
        </Box>
      </Box>

      {/* Navigation Links - Grouped & Clean */}
      <Box
        sx={{
          flexGrow: 1,
          py: 2,
          px: 1.5,
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { width: 4 },
        }}
      >
        {NAV_GROUPS.map((group) => {
          const groupItems = visibleNavItems.filter((item) => group.itemIds.includes(item.id));
          if (groupItems.length === 0) return null;

          return (
            <Box key={group.title} sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.5,
                  mb: 0.75,
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  color: BORROW_COLORS.textMuted,
                  letterSpacing: '0.05em',
                }}
              >
                {group.title}
              </Typography>

              <List disablePadding>
                {groupItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const badgeVal = getBadgeValue(item.id);

                  return (
                    <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavClick(item.path)}
                        sx={{
                          borderRadius: '6px',
                          py: 0.85,
                          px: 1.5,
                          backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textSecondary,
                          fontWeight: isActive ? 600 : 500,
                          transition: 'all 0.15s ease-in-out',
                          '&:hover': {
                            backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : BORROW_COLORS.background,
                            color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textPrimary,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            color: isActive ? BORROW_COLORS.primary : BORROW_COLORS.textMuted,
                          }}
                        >
                          {badgeVal > 0 ? (
                            <Badge badgeContent={badgeVal} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                              <IconComponent sx={{ fontSize: 19 }} />
                            </Badge>
                          ) : (
                            <IconComponent sx={{ fontSize: 19 }} />
                          )}
                        </ListItemIcon>

                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{
                            fontSize: '0.84375rem',
                            fontWeight: isActive ? 600 : 500,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* User Profile & Logout Footer */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${BORROW_COLORS.border}`,
          backgroundColor: BORROW_COLORS.surface,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Avatar
            src={adminProfile?.avatarUrl || user?.photoURL || ''}
            alt={adminProfile?.fullName || user?.displayName || 'Admin'}
            sx={{ width: 32, height: 32, bgcolor: BORROW_COLORS.primary, fontSize: '0.8125rem', fontWeight: 600 }}
          >
            {(adminProfile?.fullName || user?.displayName || user?.email || 'A')[0].toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem', color: BORROW_COLORS.textPrimary, lineHeight: 1.2 }}>
              {adminProfile?.fullName || user?.displayName || 'Librarian'}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textMuted, fontSize: '0.71875rem' }}>
              {adminProfile?.role || role || 'Librarian'}
            </Typography>
          </Box>
        </Box>

        <ListItemButton
          onClick={handleLogoutClick}
          sx={{
            borderRadius: '6px',
            py: 0.5,
            px: 1,
            color: BORROW_COLORS.error,
            '&:hover': {
              backgroundColor: BORROW_COLORS.errorLight,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 26, color: BORROW_COLORS.error }}>
            <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{ fontSize: '0.78125rem', fontWeight: 500 }}
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
