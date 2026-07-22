import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import StudentStatistics from '../../components/students/StudentStatistics';
import StudentTable from '../../components/students/StudentTable';
import StudentProfileDrawer from '../../components/students/StudentProfileDrawer';
import StudentFilters from '../../components/students/StudentFilters';
import { useStudents } from '../../hooks/useStudents';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const StudentsPage = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    selectedStudent,
    drawerOpen,
    setDrawerOpen,
  } = useStudents();

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Alphabetical' && v !== false
  ).length;

  return (
    <PageContainer
      title="Registered Students"
      subtitle="Manage registered mobile app members, track active borrow checkouts, pending requests, and overdue alerts."
    >
      {/* 1. Statistics Metric Cards */}
      <StudentStatistics />

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
        {/* Instant Search Bar */}
        <TextField
          placeholder="Search by Student Name, Register No, Department, Email, or Year..."
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

        {/* Filter Controls */}
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

      {/* 3. Student Directory Table */}
      <StudentTable />

      {/* --- DRAWERS --- */}

      {/* Student Profile Slide-Over Drawer */}
      <StudentProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        student={selectedStudent}
      />

      {/* Filter Bottom Sheet / Right Drawer */}
      <StudentFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default StudentsPage;
