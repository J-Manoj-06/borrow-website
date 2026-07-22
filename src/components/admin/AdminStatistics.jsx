import React from 'react';
import Grid from '@mui/material/Grid';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GroupIcon from '@mui/icons-material/Group';
import DashboardCard from '../common/DashboardCard';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useRBAC } from '../../hooks/useRBAC';
import { SYSTEM_ROLES } from '../../models/rbacModel';

export const AdminStatistics = () => {
  const { stats, setFilterOptions, setMatrixDrawerOpen } = useRBAC();

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Total Admins"
          value={stats.totalAdmins}
          subtitle="system accounts"
          icon={AdminPanelSettingsIcon}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor={BORROW_COLORS.primary}
          onClick={() => setFilterOptions((prev) => ({ ...prev, role: 'All' }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Super Admins"
          value={stats.superAdminsCount}
          subtitle="full system access"
          icon={ShieldIcon}
          iconBgColor="rgba(139, 92, 246, 0.1)"
          iconColor="#8B5CF6"
          onClick={() => setFilterOptions((prev) => ({ ...prev, role: SYSTEM_ROLES.SUPER_ADMIN }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Library Admins"
          value={stats.libraryAdminsCount}
          subtitle="catalog & circulation"
          icon={LocalLibraryIcon}
          iconBgColor={BORROW_COLORS.infoLight}
          iconColor={BORROW_COLORS.info}
          onClick={() => setFilterOptions((prev) => ({ ...prev, role: SYSTEM_ROLES.LIBRARY_ADMIN }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Librarians"
          value={stats.librariansCount}
          subtitle="front desk operations"
          icon={GroupIcon}
          iconBgColor={BORROW_COLORS.warningLight}
          iconColor={BORROW_COLORS.warning}
          onClick={() => setFilterOptions((prev) => ({ ...prev, role: SYSTEM_ROLES.LIBRARIAN }))}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={4} lg={2.4}>
        <DashboardCard
          title="Permission Matrix"
          value="11 Modules"
          subtitle="click to view grid"
          icon={VerifiedUserIcon}
          iconBgColor={BORROW_COLORS.successLight}
          iconColor={BORROW_COLORS.success}
          onClick={() => setMatrixDrawerOpen(true)}
        />
      </Grid>
    </Grid>
  );
};

export default AdminStatistics;
