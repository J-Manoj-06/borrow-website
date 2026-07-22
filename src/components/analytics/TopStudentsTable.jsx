import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import CustomTable from '../common/CustomTable';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const TopStudentsTable = () => {
  const { topStudents } = useAnalytics();

  const columns = [
    {
      id: 'rank',
      label: 'Rank',
      minWidth: 60,
      format: (_, __, idx) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.primary }}>
          #{idx + 1}
        </Typography>
      ),
    },
    {
      id: 'name',
      label: 'Student Borrower',
      minWidth: 220,
      format: (val, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={row.avatar || ''}
            alt={val}
            sx={{ width: 36, height: 36, bgcolor: BORROW_COLORS.primary, fontWeight: 700 }}
          >
            {val[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>
              {row.regNo}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'department',
      label: 'Department & Year',
      minWidth: 200,
      format: (val, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.year}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'totalBorrowed',
      label: 'Lifetime Borrows',
      minWidth: 140,
      format: (val) => (
        <Chip
          label={`${val} Books`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'activeLoans',
      label: 'Current Active Loans',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 700, color: val > 0 ? BORROW_COLORS.warning : BORROW_COLORS.textSecondary }}>
          {val > 0 ? `${val} books out` : 'None'}
        </Typography>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={topStudents}
      rowsPerPage={10}
      emptyType="students"
      emptyTitle="No Student Activity Yet"
      emptyDescription="Leaderboard will rank students based on checkout history."
    />
  );
};

export default TopStudentsTable;
