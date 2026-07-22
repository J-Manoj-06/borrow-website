import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';

export const BorrowRequestTable = () => {
  const {
    filteredRequests,
    loading,
    selectRequestForDetails,
    openApprovalModal,
    openRejectModal,
  } = useBorrowRequests();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'studentName',
      label: 'Student Information',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectRequestForDetails(row)}
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
      label: 'Requested Book',
      minWidth: 260,
      format: (val, row) => (
        <Box
          onClick={() => selectRequestForDetails(row)}
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
            <Typography variant="caption" noWrap sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
              by {row.bookAuthor}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'requestDate',
      label: 'Requested On',
      minWidth: 150,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
          {val ? format(new Date(val), 'dd MMM yyyy, hh:mm a') : 'N/A'}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (val) => <StatusChip status={val} />,
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 100,
      format: (val) => (
        <Chip
          label={val || 'Normal'}
          size="small"
          color={val === 'High' ? 'warning' : 'default'}
          sx={{ fontWeight: 700, fontSize: '0.725rem' }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {row.status === 'Pending' ? (
            <>
              <Tooltip title="Approve Request">
                <IconButton
                  size="small"
                  onClick={() => openApprovalModal(row)}
                  sx={{
                    backgroundColor: BORROW_COLORS.successLight,
                    color: BORROW_COLORS.success,
                    '&:hover': { backgroundColor: '#BBF7D0' },
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Reject Request">
                <IconButton
                  size="small"
                  onClick={() => openRejectModal(row)}
                  sx={{
                    backgroundColor: BORROW_COLORS.errorLight,
                    color: BORROW_COLORS.error,
                    '&:hover': { backgroundColor: '#FCA5A5' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}

          <Tooltip title="View Full Request Details">
            <IconButton
              size="small"
              onClick={() => selectRequestForDetails(row)}
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
      data={filteredRequests}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="requests"
      emptyTitle="No Borrow Requests Found"
      emptyDescription="There are currently no student borrowing requests matching your filter criteria."
    />
  );
};

export default BorrowRequestTable;
