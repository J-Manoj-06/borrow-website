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
import { BOOK_CATEGORIES, BOOK_DEPARTMENTS } from '../../models/bookModel';
import { TRANSACTION_STATUSES } from '../../models/transactionModel';
import { useTransactions } from '../../hooks/useTransactions';
import CustomButton from '../common/CustomButton';

export const TransactionFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useTransactions();

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
            Filter Transactions
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
          label="Sort Transactions By"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Newest">Newest Checkout Date</MenuItem>
          <MenuItem value="Oldest">Oldest Checkout Date</MenuItem>
          <MenuItem value="Due Date">Earliest Due Date</MenuItem>
          <MenuItem value="Student Name">Student Name (A - Z)</MenuItem>
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Transaction Status"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.ISSUED}>Issued (Active)</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.OVERDUE}>Overdue</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.RETURNED}>Returned</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.PENDING_PICKUP}>Pending Pickup</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.DAMAGED}>Damaged</MenuItem>
          <MenuItem value={TRANSACTION_STATUSES.LOST}>Lost</MenuItem>
        </TextField>

        {/* Overdue Only Toggle */}
        <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.overdueOnly}
                onChange={(e) => handleChange('overdueOnly', e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.error }}>
                Show Overdue Books Only
              </Typography>
            }
          />
        </Box>

        {/* Returned Only Toggle */}
        <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#ECFDF5', border: `1px solid ${BORROW_COLORS.successLight}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.returnedOnly}
                onChange={(e) => handleChange('returnedOnly', e.target.checked)}
                color="success"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.success }}>
                Show Completed / Returned Transactions
              </Typography>
            }
          />
        </Box>

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

        {/* Category */}
        <TextField
          select
          fullWidth
          label="Book Category"
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

export default TransactionFilters;
