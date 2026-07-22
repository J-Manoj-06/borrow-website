import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useActivity } from '../../hooks/useActivity';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const ActivityTable = () => {
  const { activities, loading, selectActivityForDetails } = useActivity();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'createdAt',
      label: 'Timestamp',
      minWidth: 160,
      format: (val) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {val ? format(new Date(val), 'hh:mm:ss a') : ''}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'activityType',
      label: 'Activity Type',
      minWidth: 200,
      format: (val) => (
        <Chip
          label={val}
          size="small"
          sx={{
            backgroundColor: val.includes('Approved') || val.includes('Returned')
              ? BORROW_COLORS.successLight
              : val.includes('Rejected') || val.includes('Deleted')
              ? BORROW_COLORS.errorLight
              : BORROW_COLORS.primaryLight,
            color: val.includes('Approved') || val.includes('Returned')
              ? BORROW_COLORS.success
              : val.includes('Rejected') || val.includes('Deleted')
              ? BORROW_COLORS.error
              : '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      id: 'module',
      label: 'Module',
      minWidth: 140,
      format: (val) => (
        <Chip label={val || 'General'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      id: 'performedBy',
      label: 'Performed By',
      minWidth: 160,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.adminEmail}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'affectedDocumentName',
      label: 'Affected Record / Item',
      minWidth: 240,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }} noWrap>
            {val || 'N/A'}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, fontFamily: 'monospace' }}>
            {row.affectedDocumentId}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (val) => <StatusChip status={val || 'Success'} />,
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 80,
      align: 'right',
      format: (_, row) => (
        <Tooltip title="Inspect Audit Log Details & Diff">
          <IconButton
            size="small"
            onClick={() => selectActivityForDetails(row)}
            sx={{ color: BORROW_COLORS.primary, backgroundColor: 'rgba(37, 99, 235, 0.08)' }}
          >
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={activities}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="activity"
      emptyTitle="No Audit Logs Recorded"
      emptyDescription="System activities will automatically populate this audit trail."
    />
  );
};

export default ActivityTable;
