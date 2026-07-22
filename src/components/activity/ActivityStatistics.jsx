import React from 'react';
import Grid from '@mui/material/Grid';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useActivity } from '../../hooks/useActivity';

export const ActivityStatistics = () => {
  const { stats, setFilterOptions } = useActivity();

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Today's Logs"
          value={stats.activitiesToday}
          subtitle="system activities"
          icon={HistoryIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Books Added"
          value={stats.booksAddedCount}
          subtitle="catalog entries"
          icon={MenuBookIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Book Added' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Books Issued"
          value={stats.booksIssuedCount}
          subtitle="checkouts issued"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Book Issued' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Books Returned"
          value={stats.booksReturnedCount}
          subtitle="check-ins processed"
          icon={AssignmentReturnedIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Book Returned' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Req Approved"
          value={stats.requestsApprovedCount}
          subtitle="borrow applications"
          icon={CheckCircleOutlineIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Borrow Request Approved' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.71}>
        <DashboardCard
          title="Req Declined"
          value={stats.requestsRejectedCount}
          subtitle="applications rejected"
          icon={HighlightOffIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Borrow Request Rejected' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.74}>
        <DashboardCard
          title="Admin Logins"
          value={stats.adminLoginsCount}
          subtitle="librarian sessions"
          icon={AdminPanelSettingsIcon}
          iconBgColor="rgba(15, 23, 42, 0.08)"
          iconColor={BORROW_COLORS.textPrimary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, activityType: 'Admin Login' }))}
        />
      </Grid>
    </Grid>
  );
};

export default ActivityStatistics;
