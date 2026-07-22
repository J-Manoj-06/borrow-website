import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { ACTIVITY_TYPES, MODULE_TYPES } from '../../models/activityModel';
import { useActivity } from '../../hooks/useActivity';
import CustomButton from '../common/CustomButton';

export const ActivityFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useActivity();

  const handleChange = (field, value) => {
    setFilterOptions((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          p: 0,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: BORROW_COLORS.primary }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            Filter Audit Logs
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1, overflowY: 'auto' }}>
        {/* Sort By */}
        <TextField
          select
          fullWidth
          label="Sort Order"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Newest">Newest First</MenuItem>
          <MenuItem value="Oldest">Oldest First</MenuItem>
        </TextField>

        {/* Activity Type */}
        <TextField
          select
          fullWidth
          label="Activity Event Type"
          value={filterOptions.activityType}
          onChange={(e) => handleChange('activityType', e.target.value)}
        >
          <MenuItem value="All">All Activity Types</MenuItem>
          {Object.values(ACTIVITY_TYPES).map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        {/* Target Module */}
        <TextField
          select
          fullWidth
          label="Target System Module"
          value={filterOptions.module}
          onChange={(e) => handleChange('module', e.target.value)}
        >
          <MenuItem value="All">All Modules</MenuItem>
          {Object.values(MODULE_TYPES).map((mod) => (
            <MenuItem key={mod} value={mod}>
              {mod}
            </MenuItem>
          ))}
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Execution Status"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Success">Success</MenuItem>
          <MenuItem value="Failed">Failed</MenuItem>
        </TextField>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2.5, borderTop: `1px solid ${BORROW_COLORS.border}`, display: 'flex', gap: 1.5 }}>
        <CustomButton variant="outlined" fullWidth onClick={resetFilters}>
          Reset All
        </CustomButton>
        <CustomButton variant="contained" fullWidth onClick={onClose}>
          Apply Filters
        </CustomButton>
      </Box>
    </Drawer>
  );
};

export default ActivityFilters;
