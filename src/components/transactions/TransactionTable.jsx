import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable from '../common/CustomTable';
import StatusBadge from '../common/StatusBadge';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionTable = ({
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const {
    filteredTransactions,
    loading,
    selectTransactionForDetails,
    openReturnModal,
  } = useTransactions();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const allPageIds = filteredTransactions.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((t) => t.id);
  const isAllPageSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const columns = [
    {
      id: 'select',
      label: (
        <Checkbox
          size="small"
          checked={isAllPageSelected}
          indeterminate={selectedIds.length > 0 && !isAllPageSelected}
          onChange={() => onToggleSelectAll && onToggleSelectAll(allPageIds)}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
      minWidth: 40,
      width: 40,
      format: (_, row) => (
        <Checkbox
          size="small"
          checked={selectedIds.includes(row.id)}
          onChange={() => onToggleSelect && onToggleSelect(row.id)}
          onClick={(e) => e.stopPropagation()}
          sx={{ p: 0, color: BORROW_COLORS.textMuted }}
        />
      ),
    },
    {
      id: 'studentName',
      label: 'Student',
      minWidth: 180,
      format: (val, row) => (
        <Box
          onClick={() => selectTransactionForDetails(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
        >
          <Avatar
            src={row.studentAvatar || ''}
            alt={val}
            sx={{ width: 32, height: 32, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {(val || 'S')[0]}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.84375rem', color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
              {row.registerNumber || row.studentId}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'bookTitle',
      label: 'Book Information',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectTransactionForDetails(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer' }}
        >
          <Box
            sx={{
              width: 28,
              height: 40,
              borderRadius: '4px',
              overflow: 'hidden',
              flexShrink: 0,
              backgroundColor: '#F1F5F9',
              border: `1px solid ${BORROW_COLORS.border}`,
            }}
          >
            <img
              src={row.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500'}
              alt={val}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.84375rem', color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
              Copy ID: {row.copyId || row.bookCopyId || 'CPY-DEFAULT'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'issueDate',
      label: 'Issue Date',
      minWidth: 120,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
          {val ? format(new Date(val), 'dd MMM yyyy') : 'Today'}
        </Typography>
      ),
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: 120,
      format: (val, row) => {
        const isOverdue = val && new Date(val) < new Date() && (row.status === 'Issued' || row.status === 'Borrowed');
        return (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isOverdue ? BORROW_COLORS.error : BORROW_COLORS.textSecondary,
            }}
          >
            {val ? format(new Date(val), 'dd MMM yyyy') : '14 Days'}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (val, row) => {
        const isOverdue = row.dueDate && new Date(row.dueDate) < new Date() && (val === 'Issued' || val === 'Borrowed');
        return <StatusBadge status={isOverdue ? 'Overdue' : val || 'Issued'} size="small" />;
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 90,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {(row.status === 'Issued' || row.status === 'Borrowed') && (
            <Tooltip title="Process Return Check-in">
              <IconButton
                size="small"
                onClick={() => openReturnModal(row)}
                sx={{
                  backgroundColor: BORROW_COLORS.successLight,
                  color: BORROW_COLORS.success,
                  '&:hover': { backgroundColor: '#BBF7D0' },
                  p: 0.5,
                }}
              >
                <AssignmentReturnIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="View Transaction Details & History">
            <IconButton
              size="small"
              onClick={() => selectTransactionForDetails(row)}
              sx={{ color: BORROW_COLORS.textSecondary, p: 0.5, '&:hover': { backgroundColor: BORROW_COLORS.background } }}
            >
              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={filteredTransactions}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="activity"
      emptyTitle="No Circulation Transactions Found"
      emptyDescription="There are currently no checkout or return records matching your filter criteria."
    />
  );
};

export default TransactionTable;
