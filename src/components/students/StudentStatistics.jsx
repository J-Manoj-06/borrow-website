import React from 'react';
import Grid from '@mui/material/Grid';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useStudents } from '../../hooks/useStudents';

export const StudentStatistics = () => {
  const { stats, setFilterOptions } = useStudents();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle="registered members"
          icon={PeopleOutlineIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'All' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Active Borrowers"
          value={stats?.activeBorrowers ?? 0}
          subtitle="holding physical books"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, currentlyBorrowingOnly: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Pending Requests"
          value={stats?.studentsWithPendingRequests ?? 0}
          subtitle="students waiting"
          icon={PendingActionsIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, pendingRequestsOnly: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Overdue Alert"
          value={stats?.studentsWithOverdueBooks ?? 0}
          subtitle="overdue borrowers"
          icon={RunningWithErrorsIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
          onClick={() => setFilterOptions((prev) => ({ ...prev, hasOverdueOnly: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Books Issued"
          value={stats?.booksCurrentlyIssued ?? 0}
          subtitle="total out in circulation"
          icon={MenuBookIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="New Members"
          value={stats?.newRegistrations ?? 0}
          subtitle="joined last 30 days"
          icon={PersonAddOutlinedIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setFilterOptions((prev) => ({ ...prev, sortBy: 'Newest' }))}
        />
      </Grid>
    </Grid>
  );
};

export default StudentStatistics;
