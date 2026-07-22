import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { BOOK_CATEGORIES, BOOK_DEPARTMENTS, BOOK_STATUSES } from '../../models/bookModel';
import { useBooks } from '../../hooks/useBooks';
import CustomButton from '../common/CustomButton';

export const BookFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useBooks();

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
      {/* Header */}
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
            Filter Catalog
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Filter Controls Form */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1, overflowY: 'auto' }}>
        {/* Sort By */}
        <TextField
          select
          fullWidth
          label="Sort Inventory By"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Newest">Newest Added</MenuItem>
          <MenuItem value="Oldest">Oldest Added</MenuItem>
          <MenuItem value="Alphabetical">Alphabetical (A - Z)</MenuItem>
          <MenuItem value="Most Borrowed">Most Borrowed</MenuItem>
        </TextField>

        {/* Category */}
        <TextField
          select
          fullWidth
          label="Category"
          value={filterOptions.category}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {BOOK_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        {/* Department */}
        <TextField
          select
          fullWidth
          label="Department"
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

        {/* Availability */}
        <TextField
          select
          fullWidth
          label="Availability Status"
          value={filterOptions.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
        >
          <MenuItem value="All">All Availability</MenuItem>
          <MenuItem value="In Stock">In Stock Only</MenuItem>
          <MenuItem value="Out of Stock">Out of Stock Only</MenuItem>
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Stock Status Tag"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Status Tags</MenuItem>
          <MenuItem value={BOOK_STATUSES.AVAILABLE}>Available</MenuItem>
          <MenuItem value={BOOK_STATUSES.LOW_STOCK}>Low Stock</MenuItem>
          <MenuItem value={BOOK_STATUSES.OUT_OF_STOCK}>Out of Stock</MenuItem>
          <MenuItem value={BOOK_STATUSES.ARCHIVED}>Archived</MenuItem>
        </TextField>

        {/* Show Archived Toggle */}
        <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.showArchived}
                onChange={(e) => handleChange('showArchived', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                View Soft-Deleted / Archived Books
              </Typography>
            }
          />
        </Box>
      </Box>

      {/* Footer Reset & Apply */}
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

export default BookFilters;
