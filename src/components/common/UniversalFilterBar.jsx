import React from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const UniversalFilterBar = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  statusOptions = [],
  categoryOptions = [],
  departmentOptions = [],
  availabilityOptions = [],
  sortOptions = [],
  dateFilter,
  onDateChange,
  showReset = true,
  customFilters,
  sx = {},
}) => {
  const hasActiveFilters = Object.values(filters).some((val) => val && val !== 'all' && val !== '');

  const handleChange = (key) => (event) => {
    if (onFilterChange) {
      onFilterChange(key, event.target.value);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        backgroundColor: BORROW_COLORS.surface,
        border: `1px solid ${BORROW_COLORS.border}`,
        borderRadius: '10px',
        mb: 2.5,
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: BORROW_COLORS.textSecondary, mr: 0.5 }}>
        <FilterListIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          Filters:
        </Box>
      </Box>

      {/* Status Filter */}
      {statusOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={filters.status || 'all'}
            onChange={handleChange('status')}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.surface,
            }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {statusOptions.map((opt) => (
              <MenuItem key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Category Filter */}
      {categoryOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={filters.category || 'all'}
            onChange={handleChange('category')}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.surface,
            }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categoryOptions.map((opt) => (
              <MenuItem key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Department Filter */}
      {departmentOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={filters.department || 'all'}
            onChange={handleChange('department')}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.surface,
            }}
          >
            <MenuItem value="all">All Departments</MenuItem>
            {departmentOptions.map((opt) => (
              <MenuItem key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Availability Filter */}
      {availabilityOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={filters.availability || 'all'}
            onChange={handleChange('availability')}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.surface,
            }}
          >
            <MenuItem value="all">All Availability</MenuItem>
            {availabilityOptions.map((opt) => (
              <MenuItem key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Sort Filter */}
      {sortOptions.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 140, ml: 'auto' }}>
          <Select
            value={filters.sort || sortOptions[0]?.value || 'newest'}
            onChange={handleChange('sort')}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '0.8125rem',
              borderRadius: '6px',
              backgroundColor: BORROW_COLORS.surface,
            }}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {customFilters}

      {/* Reset Filters Button */}
      {showReset && (hasActiveFilters || onResetFilters) && (
        <Button
          size="small"
          onClick={onResetFilters}
          startIcon={<RestartAltIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: 36,
            fontSize: '0.8125rem',
            color: BORROW_COLORS.textSecondary,
            borderColor: BORROW_COLORS.border,
            '&:hover': {
              backgroundColor: BORROW_COLORS.background,
              color: BORROW_COLORS.error,
            },
          }}
        >
          Reset Filters
        </Button>
      )}
    </Box>
  );
};

export default UniversalFilterBar;
