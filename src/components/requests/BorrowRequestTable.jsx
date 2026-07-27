import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable from '../common/CustomTable';
import StatusBadge from '../common/StatusBadge';
import { useBorrowRequests } from '../../hooks/useBorrowRequests';

export const BorrowRequestTable = ({
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const {
    filteredRequests,
    loading,
    selectRequestForDetails,
    openApprovalModal,
    openRejectModal,
  } = useBorrowRequests();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const allPageIds = filteredRequests.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((r) => r.id);
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
      label: 'Student Information',
      minWidth: 200,
      format: (val, row) => (
        <Box
          onClick={() => selectRequestForDetails(row)}
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
              {row.registerNumber} • {row.department || 'CS'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'bookTitle',
      label: 'Requested Book',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectRequestForDetails(row)}
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
              by {row.bookAuthor || 'Unknown Author'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'requestDate',
      label: 'Requested On',
      minWidth: 140,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 500 }}>
          {val ? format(new Date(val), 'dd MMM yyyy, hh:mm a') : 'Today'}
        </Typography>
      ),
    },
    {
      id: 'priority',
      label: 'Priority',
      minWidth: 90,
      format: (val) => <StatusBadge status={val || 'Normal'} size="small" />,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      format: (val) => <StatusBadge status={val || 'Pending'} size="small" />,
    },
    {
      id: 'actions',
      label: 'Quick Actions',
      minWidth: 110,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {row.status === 'Pending' && (
            <>
              <Tooltip title="Approve Request">
                <IconButton
                  size="small"
                  onClick={() => openApprovalModal(row)}
                  sx={{
                    backgroundColor: BORROW_COLORS.successLight,
                    color: BORROW_COLORS.success,
                    '&:hover': { backgroundColor: '#BBF7D0' },
                    p: 0.5,
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16 }} />
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
                    p: 0.5,
                  }}
                >
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </>
          )}

          <Tooltip title="View Request Details & Timeline">
            <IconButton
              size="small"
              onClick={() => selectRequestForDetails(row)}
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
