import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import format from 'date-fns/format';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useNotifications } from '../../hooks/useNotifications';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const NotificationTable = () => {
  const { notifications, loading, deleteNotification } = useNotifications();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'title',
      label: 'Notification Title & Message',
      minWidth: 280,
      format: (val, row) => (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {row.message}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'type',
      label: 'Category Type',
      minWidth: 160,
      format: (val) => <Chip label={val} size="small" color="primary" sx={{ fontWeight: 700 }} />,
    },
    {
      id: 'recipients',
      label: 'Target Audience',
      minWidth: 180,
      format: (val, row) => (
        <Chip
          label={val || row.recipientTarget || 'All Students'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      id: 'createdBy',
      label: 'Created By',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
          {val || 'Admin Librarian'}
        </Typography>
      ),
    },
    {
      id: 'sentAt',
      label: 'Sent Timestamp',
      minWidth: 150,
      format: (val) => (
        <Typography variant="caption" sx={{ fontWeight: 600, color: BORROW_COLORS.textSecondary }}>
          {val ? format(new Date(val), 'dd MMM yyyy, hh:mm a') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (val) => <StatusChip status={val || 'Sent'} />,
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 80,
      align: 'right',
      format: (_, row) => (
        <Tooltip title="Delete Notification Record">
          <IconButton size="small" onClick={() => deleteNotification(row.id)} sx={{ color: BORROW_COLORS.error }}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={notifications}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="activity"
      emptyTitle="No Notifications Sent Yet"
      emptyDescription="Create and dispatch push notifications or return reminders to mobile app members."
    />
  );
};

export default NotificationTable;
