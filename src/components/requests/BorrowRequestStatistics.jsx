import React from 'react';
import Grid from '@mui/material/Grid';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';

export const BorrowRequestStatistics = () => {
  const { stats, setFilterOptions } = useBorrowRequests();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Pending Requests"
          value={stats?.pendingRequests ?? 0}
          subtitle="action required"
          icon={PendingActionsIcon}
          iconBgColor="rgba(245, 158, 11, 0.15)"
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Pending' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Approved Today"
          value={stats?.approvedToday ?? 0}
          subtitle="permits granted"
          icon={CheckCircleOutlineIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Approved' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Rejected Today"
          value={stats?.rejectedToday ?? 0}
          subtitle="declined requests"
          icon={HighlightOffIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Rejected' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Active Borrows"
          value={stats?.activeBorrows ?? 0}
          subtitle="currently checked out"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Issued' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Completed"
          value={stats?.completedRequests ?? 0}
          subtitle="returned & closed"
          icon={AssignmentTurnedInIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Returned' }))}
        />
      </Grid>
    </Grid>
  );
};

export default BorrowRequestStatistics;
