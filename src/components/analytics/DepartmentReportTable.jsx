import React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CustomTable from '../common/CustomTable';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const DepartmentReportTable = () => {
  const { departmentReport } = useAnalytics();

  const columns = [
    {
      id: 'department',
      label: 'Department / Faculty',
      minWidth: 240,
      format: (val) => (
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
          {val}
        </Typography>
      ),
    },
    {
      id: 'studentCount',
      label: 'Registered Students',
      minWidth: 160,
      format: (val) => (
        <Chip
          label={`${val} Members`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 700 }}
        />
      ),
    },
    {
      id: 'booksBorrowed',
      label: 'Books Borrowed',
      minWidth: 150,
      format: (val) => (
        <Chip
          label={`${val} Loans`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.primaryLight, color: '#FFFFFF', fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'topCategory',
      label: 'Most Popular Subject',
      minWidth: 200,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.primary }}>
          {val || 'Computer Science'}
        </Typography>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={departmentReport}
      rowsPerPage={10}
      emptyType="students"
      emptyTitle="No Department Data"
      emptyDescription="Department usage reports will accumulate as students register."
    />
  );
};

export default DepartmentReportTable;
