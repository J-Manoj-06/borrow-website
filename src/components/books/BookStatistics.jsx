import React from 'react';
import Grid from '@mui/material/Grid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useBooks } from '../../hooks/useBooks';

export const BookStatistics = () => {
  const { stats, setFilterOptions } = useBooks();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Total Titles"
          value={stats?.totalTitles ?? 0}
          subtitle="active catalog titles"
          icon={MenuBookIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, showArchived: false }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Available Copies"
          value={stats?.availableCopies ?? 0}
          subtitle="ready for checkout"
          icon={CheckCircleOutlineIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setFilterOptions((prev) => ({ ...prev, availability: 'In Stock', showArchived: false }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Borrowed Copies"
          value={stats?.borrowedCopies ?? 0}
          subtitle="currently out"
          icon={SwapHorizontalCircleOutlinedIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, availability: 'Out of Stock', showArchived: false }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Archived Books"
          value={stats?.archivedBooks ?? 0}
          subtitle="hidden from mobile app"
          icon={ArchiveOutlinedIcon}
          iconBgColor="rgba(100, 116, 139, 0.12)"
          iconColor={BORROW_COLORS.textSecondary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, showArchived: true }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Damaged Books"
          value={stats?.damagedCopies ?? stats?.damagedBooks ?? 0}
          subtitle="under repair / audit"
          icon={ReportProblemOutlinedIcon}
          iconBgColor={BORROW_COLORS.errorLight}
          iconColor={BORROW_COLORS.error}
        />
      </Grid>
    </Grid>
  );
};

export default BookStatistics;
