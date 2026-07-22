import React from 'react';
import Grid from '@mui/material/Grid';
import SendIcon from '@mui/icons-material/Send';
import CampaignIcon from '@mui/icons-material/Campaign';
import ScheduleSendIcon from '@mui/icons-material/ScheduleSend';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import VerifiedIcon from '@mui/icons-material/Verified';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationStatistics = () => {
  const { stats, setFilterOptions, setAnnouncementDialogOpen } = useNotifications();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Sent Today"
          value={stats.sentToday}
          subtitle="dispatched notifications"
          icon={SendIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Sent' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Announcements"
          value={stats.announcementsCount}
          subtitle="pinned mobile notices"
          icon={CampaignIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
          onClick={() => setAnnouncementDialogOpen(true)}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Scheduled"
          value={stats.scheduledCount}
          subtitle="future push messages"
          icon={ScheduleSendIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Scheduled' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Unread Inbox"
          value={stats.unreadCount}
          subtitle="student mobile feeds"
          icon={MarkEmailUnreadIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Delivery Rate"
          value={`${stats.deliveryRate}%`}
          subtitle="FCM push success"
          icon={VerifiedIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
        />
      </Grid>
    </Grid>
  );
};

export default NotificationStatistics;
