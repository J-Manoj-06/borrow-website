import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import toast from 'react-hot-toast';

// Icons
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import UniversalSearchBar from '../../components/common/UniversalSearchBar';
import UniversalFilterBar from '../../components/common/UniversalFilterBar';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';

import GroupedNotificationList from '../../components/notifications/GroupedNotificationList';
import NotificationBulkActionBar from '../../components/notifications/NotificationBulkActionBar';
import CreateNotificationDialog from '../../components/notifications/CreateNotificationDialog';
import CreateAnnouncementDialog from '../../components/notifications/CreateAnnouncementDialog';

import { useNotifications } from '../../hooks/useNotifications';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { exportToCSV } from '../../services/exportService';

export const NotificationsPage = () => {
  const {
    notifications,
    filteredNotifications,
    loading,
    searchQuery,
    setSearchQuery,
    filterOptions,
    setFilterOptions,
    resetFilters,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createDialogOpen,
    setCreateDialogOpen,
    announcementDialogOpen,
    setAnnouncementDialogOpen,
  } = useNotifications();

  // Multi-Select Selected Notifications State
  const [selectedIds, setSelectedIds] = useState([]);

  // Unread Count
  const unreadCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.read).length;
  }, [notifications]);

  const handleFilterChange = (key, value) => {
    setFilterOptions((prev) => ({ ...prev, [key]: value }));
  };

  // Multi-Select Handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Operations
  const handleBulkMarkRead = () => {
    for (const id of selectedIds) {
      if (markAsRead) markAsRead(id);
    }
    toast.success(`Marked ${selectedIds.length} notifications as read!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    for (const id of selectedIds) {
      if (deleteNotification) deleteNotification(id);
    }
    toast.error(`Deleted ${selectedIds.length} notifications.`);
    setSelectedIds([]);
  };

  const handleBulkArchive = () => {
    toast.success(`Archived ${selectedIds.length} notifications.`);
    setSelectedIds([]);
  };

  const handleQuickAction = (notification) => {
    toast.success(`Processing action for: ${notification.title}`);
  };

  return (
    <PageContainer
      title="Notifications Inbox"
      subtitle={`Alerts & System Communications — ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}.`}
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {unreadCount > 0 && (
            <CustomButton
              variant="outline"
              startIcon={<MarkEmailReadOutlinedIcon />}
              onClick={() => {
                if (markAllAsRead) markAllAsRead();
                toast.success('All notifications marked as read!');
              }}
            >
              Mark All Read
            </CustomButton>
          )}

          <CustomButton
            variant="outline"
            startIcon={<CampaignIcon />}
            onClick={() => setAnnouncementDialogOpen(true)}
          >
            + Announcement
          </CustomButton>

          <CustomButton
            variant="primary"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            + Create Alert
          </CustomButton>
        </Box>
      }
    >
      {/* 1. Universal Search Bar */}
      <Box sx={{ mb: 2 }}>
        <UniversalSearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
          placeholder="Search by Student, Book, Notification Type, or Keywords..."
          width="100%"
        />
      </Box>

      {/* 2. Universal Filter Bar */}
      <UniversalFilterBar
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        statusOptions={[
          { label: 'Unread Only', value: 'Unread' },
          { label: 'Read Only', value: 'Read' },
          { label: 'Borrow Requests', value: 'Borrow Requests' },
          { label: 'Overdue Alerts', value: 'Overdue' },
        ]}
      />

      {/* 3. Grouped Notification List Inbox */}
      {loading ? (
        <SkeletonLoader type="table" rows={6} />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          type="notifications"
          title="Everything is up to date!"
          description="There are currently no unread notifications or system alerts matching your search criteria."
        />
      ) : (
        <GroupedNotificationList
          notifications={filteredNotifications}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onMarkRead={(id) => markAsRead && markAsRead(id)}
          onDismiss={(id) => deleteNotification && deleteNotification(id)}
          onQuickAction={handleQuickAction}
        />
      )}

      {/* 4. Sticky Bulk Action Bar */}
      <NotificationBulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onBulkMarkRead={handleBulkMarkRead}
        onBulkDelete={handleBulkDelete}
        onBulkArchive={handleBulkArchive}
      />

      {/* --- DIALOGS --- */}
      <CreateNotificationDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <CreateAnnouncementDialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} />
    </PageContainer>
  );
};

export default NotificationsPage;
