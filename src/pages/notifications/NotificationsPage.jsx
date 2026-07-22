import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import NotificationStatistics from '../../components/notifications/NotificationStatistics';
import NotificationTable from '../../components/notifications/NotificationTable';
import CreateNotificationDialog from '../../components/notifications/CreateNotificationDialog';
import CreateAnnouncementDialog from '../../components/notifications/CreateAnnouncementDialog';
import NotificationTemplatesDialog from '../../components/notifications/NotificationTemplatesDialog';
import NotificationFilters from '../../components/notifications/NotificationFilters';
import { useNotifications } from '../../hooks/useNotifications';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const NotificationsPage = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    createDialogOpen,
    setCreateDialogOpen,
    announcementDialogOpen,
    setAnnouncementDialogOpen,
    templateDialogOpen,
    setTemplateDialogOpen,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useNotifications();

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Newest'
  ).length;

  return (
    <PageContainer
      title="Notifications & Announcements"
      subtitle="Broadcast mobile push notifications, publish pinned announcements, and schedule return reminders."
      actions={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <CustomButton
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Templates
          </CustomButton>

          <CustomButton
            variant="outlined"
            startIcon={<CampaignIcon />}
            onClick={() => setAnnouncementDialogOpen(true)}
          >
            + Announcement
          </CustomButton>

          <CustomButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            + Create Notification
          </CustomButton>
        </Box>
      }
    >
      {/* 1. Statistics Cards */}
      <NotificationStatistics />

      {/* 2. Search & Filter Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          backgroundColor: BORROW_COLORS.surface,
          p: 2,
          borderRadius: '16px',
          border: `1px solid ${BORROW_COLORS.border}`,
          boxShadow: BORROW_COLORS.cardShadow,
        }}
      >
        {/* Search */}
        <TextField
          placeholder="Search by Notification Title, Message, Category, or Recipient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: BORROW_COLORS.primary }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Trigger */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <CustomButton
            variant="outlined"
            startIcon={
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterListIcon />
              </Badge>
            }
            onClick={() => setFilterDrawerOpen(true)}
            sx={{ borderColor: BORROW_COLORS.border }}
          >
            Filters
          </CustomButton>

          {(searchQuery || activeFilterCount > 0) && (
            <CustomButton variant="text" startIcon={<RestartAltIcon />} onClick={resetFilters}>
              Clear Search
            </CustomButton>
          )}
        </Box>
      </Box>

      {/* 3. Notification History Data Table */}
      <NotificationTable />

      {/* --- DIALOGS & DRAWERS --- */}

      <CreateNotificationDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
      <CreateAnnouncementDialog open={announcementDialogOpen} onClose={() => setAnnouncementDialogOpen(false)} />
      <NotificationTemplatesDialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} />
      <NotificationFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default NotificationsPage;
