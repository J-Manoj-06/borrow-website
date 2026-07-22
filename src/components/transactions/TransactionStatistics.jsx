import React from 'react';
import Grid from '@mui/material/Grid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionStatistics = () => {
  const { stats, setFilterOptions } = useTransactions();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Issued Today"
          value={stats.booksIssuedToday}
          subtitle="checkouts logged"
          icon={MenuBookIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Issued', overdueOnly: false }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Returned Today"
          value={stats.booksReturnedToday}
          subtitle="processed into shelf"
          icon={AssignmentReturnedIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setFilterOptions((prev) => ({ ...prev, returnedOnly: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Active Loans"
          value={stats.currentlyBorrowed}
          subtitle="currently out"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Issued', overdueOnly: false }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Overdue Books"
          value={stats.overdueBooks}
          subtitle="deadline exceeded"
          icon={RunningWithErrorsIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
          onClick={() => setFilterOptions((prev) => ({ ...prev, overdueOnly: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Pending Pickups"
          value={stats.pendingPickups}
          subtitle="approved & waiting"
          icon={HourglassTopIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, status: 'Pending Pickup' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2}>
        <DashboardCard
          title="Available Copies"
          value={stats.availableCopies}
          subtitle="ready for checkout"
          icon={CheckCircleOutlineIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
        />
      </Grid>
    </Grid>
  );
};

export default TransactionStatistics;
