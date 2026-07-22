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
import { BOOK_DEPARTMENTS } from '../../models/bookModel';
import { STUDENT_STATUSES } from '../../models/studentModel';
import { useStudents } from '../../hooks/useStudents';
import CustomButton from '../common/CustomButton';

export const StudentFilters = ({ open, onClose }) => {
  const { filterOptions, setFilterOptions, resetFilters } = useStudents();

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
            Filter Student Directory
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
          label="Sort Directory By"
          value={filterOptions.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <MenuItem value="Alphabetical">Alphabetical (A - Z)</MenuItem>
          <MenuItem value="Newest">Newest Registrations</MenuItem>
          <MenuItem value="Oldest">Oldest Members</MenuItem>
          <MenuItem value="Most Active">Most Borrowing Activity</MenuItem>
        </TextField>

        {/* Status */}
        <TextField
          select
          fullWidth
          label="Student Membership Status"
          value={filterOptions.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value={STUDENT_STATUSES.ACTIVE}>Active</MenuItem>
          <MenuItem value={STUDENT_STATUSES.HAS_BORROWED}>Has Borrowed Books</MenuItem>
          <MenuItem value={STUDENT_STATUSES.PENDING_REQUESTS}>Pending Requests</MenuItem>
          <MenuItem value={STUDENT_STATUSES.OVERDUE}>Overdue</MenuItem>
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

        {/* Academic Year */}
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

        {/* Toggle Switches */}
        <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.currentlyBorrowingOnly}
                onChange={(e) => handleChange('currentlyBorrowingOnly', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Currently Borrowing Books Only
              </Typography>
            }
          />
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.hasOverdueOnly}
                onChange={(e) => handleChange('hasOverdueOnly', e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.error }}>
                Students with Overdue Books Only
              </Typography>
            }
          />
        </Box>

        <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#DBEAFE', border: `1px solid ${BORROW_COLORS.primaryLight}` }}>
          <FormControlLabel
            control={
              <Switch
                checked={filterOptions.pendingRequestsOnly}
                onChange={(e) => handleChange('pendingRequestsOnly', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.primary }}>
                Students with Pending Requests Only
              </Typography>
            }
          />
        </Box>
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

export default StudentFilters;
