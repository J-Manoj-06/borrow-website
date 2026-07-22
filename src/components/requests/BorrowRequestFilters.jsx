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
import { BOOK_CATEGORIES, BOOK_DEPARTMENTS } from '../../models/bookModel';
import { REQUEST_STATUSES } from '../../models/borrowRequestModel';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';
import CustomButton from '../common/CustomButton';

export const BorrowRequestFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useBorrowRequests();

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
            Filter Borrow Requests
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
          label="Sort Requests By"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Newest">Newest First</MenuItem>
          <MenuItem value="Oldest">Oldest First</MenuItem>
          <MenuItem value="Student Name">Student Name (A - Z)</MenuItem>
          <MenuItem value="Book Name">Book Name (A - Z)</MenuItem>
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Request Status"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value={REQUEST_STATUSES.PENDING}>Pending</MenuItem>
          <MenuItem value={REQUEST_STATUSES.APPROVED}>Approved</MenuItem>
          <MenuItem value={REQUEST_STATUSES.ISSUED}>Issued</MenuItem>
          <MenuItem value={REQUEST_STATUSES.RETURNED}>Returned</MenuItem>
          <MenuItem value={REQUEST_STATUSES.REJECTED}>Rejected</MenuItem>
          <MenuItem value={REQUEST_STATUSES.OVERDUE}>Overdue</MenuItem>
        </TextField>

        {/* Department */}
        <TextField
          select
          fullWidth
          label="Student Department"
          value={filterOptions.department}
          onChange={(e) => handleChange('department', e.target.value)}
        >
          <MenuItem value="All">All Departments</MenuItem>
          {BOOK_DEPARTMENTS.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </TextField>

        {/* Year */}
        <TextField
          select
          fullWidth
          label="Academic Year"
          value={filterOptions.year}
          onChange={(e) => handleChange('year', e.target.value)}
        >
          <MenuItem value="All">All Academic Years</MenuItem>
          <MenuItem value="1st Year">1st Year</MenuItem>
          <MenuItem value="2nd Year">2nd Year</MenuItem>
          <MenuItem value="3rd Year">3rd Year</MenuItem>
          <MenuItem value="4th Year">4th Year</MenuItem>
        </TextField>

        {/* Book Category */}
        <TextField
          select
          fullWidth
          label="Book Category"
          value={filterOptions.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <MenuItem value="All">All Book Categories</MenuItem>
          {BOOK_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
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

export default BorrowRequestFilters;
