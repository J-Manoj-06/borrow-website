import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import format from 'date-fns/format';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../common/CustomTable';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { ROUTES } from '../../constants/routes';

export const OverdueReportTable = () => {
  const { overdueReport } = useAnalytics();
  const navigate = useNavigate();

  const columns = [
    {
      id: 'studentName',
      label: 'Student Borrower',
      minWidth: 200,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 700 }}>
            {row.registerNumber}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'bookTitle',
      label: 'Overdue Book',
      minWidth: 240,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Copy ID: {row.bookCopyId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'issueDate',
      label: 'Issue Date',
      minWidth: 130,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
          {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: 130,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 800 }}>
          {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'daysOverdue',
      label: 'Days Overdue',
      minWidth: 140,
      format: (val) => (
        <Chip
          label={`${val || 5} DAYS OVERDUE`}
          size="small"
          sx={{ backgroundColor: BORROW_COLORS.errorLight, color: BORROW_COLORS.error, fontWeight: 800 }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 90,
      align: 'right',
      format: () => (
        <Tooltip title="View Transaction in Returns Module">
          <IconButton size="small" onClick={() => navigate(ROUTES.RETURNS)} sx={{ color: BORROW_COLORS.error }}>
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={overdueReport}
      rowsPerPage={10}
      emptyType="activity"
      emptyTitle="No Overdue Books!"
      emptyDescription="All student borrowing checkouts are within their authorized return deadlines."
    />
  );
};

export default OverdueReportTable;
