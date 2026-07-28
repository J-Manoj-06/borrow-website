import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// Icons
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import StatusBadge from '../common/StatusBadge';
import CustomButton from '../common/CustomButton';

export const GroupedNotificationList = ({
  notifications = [],
  selectedIds = [],
  onToggleSelect,
  onMarkRead,
  onDismiss,
  onQuickAction,
}) => {
  if (notifications.length === 0) return null;

  // Group Notifications into Today, Yesterday, This Week, Older
  const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] };
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  notifications.forEach((n) => {
    const d = n.timestamp ? new Date(n.timestamp) : new Date();
    const dStr = d.toDateString();
    if (dStr === todayStr) groups.Today.push(n);
    else if (dStr === yesterdayStr) groups.Yesterday.push(n);
    else if (new Date() - d < 7 * 24 * 60 * 60 * 1000) groups['This Week'].push(n);
    else groups.Older.push(n);
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Borrow Request':
        return <MenuBookOutlinedIcon sx={{ fontSize: 18, color: BORROW_COLORS.primary }} />;
      case 'Overdue':
        return <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: BORROW_COLORS.error }} />;
      case 'Student Alert':
        return <PersonOutlinedIcon sx={{ fontSize: 18, color: BORROW_COLORS.info }} />;
      default:
        return <NotificationsActiveOutlinedIcon sx={{ fontSize: 18, color: BORROW_COLORS.warning }} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Object.entries(groups).map(([groupTitle, groupItems]) => {
        if (groupItems.length === 0) return null;

        return (
          <Box key={groupTitle}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1.5, display: 'block', letterSpacing: '0.05em' }}>
              {groupTitle.toUpperCase()} ({groupItems.length})
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {groupItems.map((n) => {
                const isSelected = selectedIds.includes(n.id);
                const isUnread = !n.read;

                return (
                  <Card
                    key={n.id}
                    sx={{
                      p: 1.75,
                      borderRadius: '10px',
                      border: isSelected ? `2px solid ${BORROW_COLORS.primary}` : `1px solid ${BORROW_COLORS.border}`,
                      backgroundColor: isUnread ? BORROW_COLORS.primarySurface : BORROW_COLORS.surface,
                      boxShadow: BORROW_COLORS.cardShadow,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      transition: 'all 0.12s ease',
                      '&:hover': {
                        borderColor: '#CBD5E1',
                      },
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={isSelected}
                      onChange={() => onToggleSelect(n.id)}
                      sx={{ p: 0, color: BORROW_COLORS.textMuted }}
                    />

                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        backgroundColor: BORROW_COLORS.background,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {getIcon(n.type || n.category)}
                    </Box>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.84375rem', color: BORROW_COLORS.textPrimary }}>
                          {n.title || 'System Notification'}
                        </Typography>
                        {isUnread && <StatusBadge status="Pending" label="UNREAD" size="small" />}
                      </Box>

                      <Typography variant="body2" noWrap sx={{ color: BORROW_COLORS.textSecondary, fontSize: '0.8125rem' }}>
                        {n.message || n.description}
                      </Typography>

                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, fontSize: '0.71875rem' }}>
                        {n.timestamp ? new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'} • {n.category || 'System'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {n.actionLabel && (
                        <CustomButton
                          variant="secondary"
                          size="small"
                          onClick={() => onQuickAction && onQuickAction(n)}
                          sx={{ fontSize: '0.71875rem', py: 0.25, px: 1 }}
                        >
                          {n.actionLabel}
                        </CustomButton>
                      )}

                      {isUnread && (
                        <Tooltip title="Mark as Read">
                          <IconButton size="small" onClick={() => onMarkRead(n.id)} sx={{ color: BORROW_COLORS.textMuted, p: 0.5 }}>
                            <MarkEmailReadOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Dismiss Notification">
                        <IconButton size="small" onClick={() => onDismiss(n.id)} sx={{ color: BORROW_COLORS.textMuted, p: 0.5 }}>
                          <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default GroupedNotificationList;
