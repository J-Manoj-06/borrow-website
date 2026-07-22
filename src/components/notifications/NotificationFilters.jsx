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
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../../models/notificationModel';
import { useNotifications } from '../../hooks/useNotifications';
import CustomButton from '../common/CustomButton';

export const NotificationFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useNotifications();

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
            Filter Notification History
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
          label="Sort History By"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Newest">Newest Sent First</MenuItem>
          <MenuItem value="Oldest">Oldest Sent First</MenuItem>
        </TextField>

        {/* Type */}
        <TextField
          select
          fullWidth
          label="Notification Category"
          value={filterOptions.type}
          onChange={(e) => handleChange('type', e.target.value)}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {Object.values(NOTIFICATION_TYPES).map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        {/* Priority */}
        <TextField
          select
          fullWidth
          label="Priority Level"
          value={filterOptions.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
        >
          <MenuItem value="All">All Priorities</MenuItem>
          {Object.values(NOTIFICATION_PRIORITIES).map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Delivery Status"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Sent">Sent & Delivered</MenuItem>
          <MenuItem value="Scheduled">Scheduled Future</MenuItem>
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

export default NotificationFilters;
