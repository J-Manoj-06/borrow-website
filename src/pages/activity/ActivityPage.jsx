import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Badge from '@mui/material/Badge';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableViewIcon from '@mui/icons-material/TableView';
import TimelineIcon from '@mui/icons-material/Timeline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import ActivityStatistics from '../../components/activity/ActivityStatistics';
import ActivityTable from '../../components/activity/ActivityTable';
import ActivityTimeline from '../../components/activity/ActivityTimeline';
import ActivityDrawer from '../../components/activity/ActivityDrawer';
import ActivityFilters from '../../components/activity/ActivityFilters';
import { useActivity } from '../../hooks/useActivity';
import { exportToCSV, exportToPDF } from '../../services/exportService';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import toast from 'react-hot-toast';

export const ActivityPage = () => {
  const {
    activities,
    searchQuery,
    setSearchQuery,
    filterOptions,
    resetFilters,
    viewMode,
    setViewMode,
    selectedActivity,
    drawerOpen,
    setDrawerOpen,
    filterDrawerOpen,
    setFilterDrawerOpen,
  } = useActivity();

  const activeFilterCount = Object.values(filterOptions).filter(
    (v) => v !== 'All' && v !== 'Newest'
  ).length;

  const handleExport = () => {
    const headers = [
      { key: 'createdAt', label: 'Timestamp' },
      { key: 'activityType', label: 'Activity Type' },
      { key: 'module', label: 'Module' },
      { key: 'performedBy', label: 'Performed By' },
      { key: 'adminEmail', label: 'Admin Email' },
      { key: 'affectedDocumentName', label: 'Affected Record' },
      { key: 'status', label: 'Status' },
    ];
    exportToCSV('Borrow_System_Activity_Audit_Log', headers, activities);
    toast.success('Exported system audit logs to CSV spreadsheet!');
  };

  return (
    <PageContainer
      title="Activity Logs & Audit Trail"
      subtitle="Complete system audit transparency tracking every librarian activity, book update, checkout, and administrative event."
      actions={
        <CustomButton
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
        >
          Export Audit Logs
        </CustomButton>
      }
    >
      {/* 1. Statistics Cards */}
      <ActivityStatistics />

      {/* 2. Search, Filter & View Switcher Bar */}
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
          placeholder="Search by Activity Type, Module, Performed By, Book Title, or Copy ID..."
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

        {/* View Switcher & Filters */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, nextMode) => nextMode && setViewMode(nextMode)}
            size="small"
            sx={{ backgroundColor: '#F1F5F9', p: 0.5, borderRadius: '10px' }}
          >
            <ToggleButton value="table" sx={{ borderRadius: '8px', px: 2, fontWeight: 700 }}>
              <TableViewIcon fontSize="small" sx={{ mr: 0.5 }} /> Table
            </ToggleButton>
            <ToggleButton value="timeline" sx={{ borderRadius: '8px', px: 2, fontWeight: 700 }}>
              <TimelineIcon fontSize="small" sx={{ mr: 0.5 }} /> Timeline
            </ToggleButton>
          </ToggleButtonGroup>

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

      {/* 3. Data View (Table vs Timeline) */}
      {viewMode === 'table' ? <ActivityTable /> : <ActivityTimeline />}

      {/* --- DRAWERS --- */}

      <ActivityDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} activity={selectedActivity} />
      <ActivityFilters open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)} />
    </PageContainer>
  );
};

export default ActivityPage;
