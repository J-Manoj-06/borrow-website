import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useTransactions } from '../../hooks/useTransactions';

export const TransactionTable = () => {
  const {
    filteredTransactions,
    loading,
    selectTransactionForDetails,
    openReturnModal,
  } = useTransactions();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'studentName',
      label: 'Student Borrower',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectTransactionForDetails(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Avatar
            src={row.studentAvatar || ''}
            alt={val}
            sx={{ width: 36, height: 36, bgcolor: BORROW_COLORS.primary, fontWeight: 700, fontSize: '0.85rem' }}
          >
            {val[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600 }}>
              {row.registerNumber}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'bookTitle',
      label: 'Book & Physical Copy ID',
      minWidth: 260,
      format: (val, row) => (
        <Box
          onClick={() => selectTransactionForDetails(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Box
            sx={{
              width: 32,
              height: 44,
              borderRadius: '6px',
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
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.primary, fontWeight: 700, display: 'block' }}>
              Copy: {row.bookCopyId}
            </Typography>
          </Box>
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
      format: (val, row) => (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: row.isOverdue ? BORROW_COLORS.error : BORROW_COLORS.textPrimary,
          }}
        >
          {val ? format(new Date(val), 'dd MMM yyyy') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'daysRemaining',
      label: 'Loan Progress',
      minWidth: 140,
      format: (_, row) => {
        if (row.computedStatus === 'Returned') {
          return (
            <Chip
              label="Returned"
              size="small"
              sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 700, fontSize: '0.725rem' }}
            />
          );
        }
        if (row.isOverdue) {
          return (
            <Chip
              label={`${row.daysOverdue} DAYS OVERDUE`}
              size="small"
              sx={{ backgroundColor: BORROW_COLORS.errorLight, color: BORROW_COLORS.error, fontWeight: 800, fontSize: '0.725rem' }}
            />
          );
        }
        return (
          <Chip
            label={`${row.daysRemaining} days left`}
            size="small"
            sx={{ backgroundColor: BORROW_COLORS.infoLight, color: BORROW_COLORS.info, fontWeight: 700, fontSize: '0.725rem' }}
          />
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (_, row) => <StatusChip status={row.computedStatus || row.status} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {(row.computedStatus === 'Issued' || row.computedStatus === 'Overdue') && (
            <Tooltip title="Mark Book Returned">
              <IconButton
                size="small"
                onClick={() => openReturnModal(row)}
                sx={{
                  backgroundColor: BORROW_COLORS.successLight,
                  color: BORROW_COLORS.success,
                  '&:hover': { backgroundColor: '#BBF7D0' },
                }}
              >
                <AssignmentReturnedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="View Transaction Audit Trail">
            <IconButton
              size="small"
              onClick={() => selectTransactionForDetails(row)}
              sx={{ color: BORROW_COLORS.textSecondary, '&:hover': { backgroundColor: '#F1F5F9' } }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
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
      emptyTitle="No Borrow Transactions"
      emptyDescription="There are no active or historical checkouts matching your filter criteria."
    />
  );
};

export default TransactionTable;
