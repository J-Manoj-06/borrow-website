import React from 'react';
import Grid from '@mui/material/Grid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useAnalytics } from '../../hooks/useAnalytics';

export const AnalyticsStatistics = () => {
  const { summaryStats } = useAnalytics();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Total Books"
          value={summaryStats.totalBooks}
          subtitle="active catalog"
          icon={MenuBookIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Total Students"
          value={summaryStats.totalStudents}
          subtitle="registered users"
          icon={PeopleOutlineIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Books Issued"
          value={summaryStats.booksIssued}
          subtitle="total checkouts"
          icon={AssignmentTurnedInIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Books Returned"
          value={summaryStats.booksReturned}
          subtitle="check-ins"
          icon={AssignmentReturnedIcon}
          iconBgColor="rgba(34, 197, 94, 0.1)"
          iconColor={BORROW_COLORS.success}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Currently Borrowed"
          value={summaryStats.currentlyBorrowed}
          subtitle="active loans"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Pending Requests"
          value={summaryStats.pendingRequests}
          subtitle="awaiting action"
          icon={PendingActionsIcon}
          iconBgColor="rgba(245, 158, 11, 0.15)"
          iconColor={BORROW_COLORS.warning}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Overdue Books"
          value={summaryStats.overdueBooks}
          subtitle="deadline exceeded"
          icon={RunningWithErrorsIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3} lg={1.5}>
        <DashboardCard
          title="Avg Loan Period"
          value={`${summaryStats.avgBorrowDuration} Days`}
          subtitle="standard checkout"
          icon={AccessTimeIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
        />
      </Grid>
    </Grid>
  );
};

export default AnalyticsStatistics;
