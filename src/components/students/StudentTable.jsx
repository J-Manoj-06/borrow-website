import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useStudents } from '../../hooks/useStudents';

export const StudentTable = () => {
  const {
    filteredStudents,
    loading,
    selectStudentForProfile,
  } = useStudents();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'fullName',
      label: 'Student Member',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectStudentForProfile(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Avatar
            src={row.avatarUrl || ''}
            alt={val || row.name}
            sx={{ width: 40, height: 40, bgcolor: BORROW_COLORS.primary, fontWeight: 700 }}
          >
            {(val || row.name || 'S')[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
              {val || row.name}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>
              Reg No: {row.registerNumber}
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
          <Typography variant="body2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.year}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      label: 'Email Contact',
      minWidth: 200,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
          {val || 'student@borrow.edu'}
        </Typography>
      ),
    },
    {
      id: 'borrowedCount',
      label: 'Active Loans',
      minWidth: 120,
      format: (val, row) => (
        <Chip
          label={`${val || 0} Books`}
          size="small"
          sx={{
            backgroundColor: row.hasOverdue
              ? BORROW_COLORS.errorLight
              : val > 0
              ? BORROW_COLORS.warningLight
              : '#F1F5F9',
            color: row.hasOverdue
              ? BORROW_COLORS.error
              : val > 0
              ? BORROW_COLORS.warning
              : BORROW_COLORS.textSecondary,
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      id: 'pendingCount',
      label: 'Pending Reqs',
      minWidth: 120,
      format: (val) => (
        <Chip
          label={`${val || 0} Requests`}
          size="small"
          sx={{
            backgroundColor: val > 0 ? BORROW_COLORS.infoLight : '#F1F5F9',
            color: val > 0 ? BORROW_COLORS.info : BORROW_COLORS.textSecondary,
            fontWeight: 700,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 140,
      format: (_, row) => <StatusChip status={row.computedStatus || row.status} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      format: (_, row) => (
        <Tooltip title="View Complete Member Profile">
          <IconButton
            size="small"
            onClick={() => selectStudentForProfile(row)}
            sx={{ color: BORROW_COLORS.primary, backgroundColor: 'rgba(37, 99, 235, 0.08)', '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.15)' } }}
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
      data={filteredStudents}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="students"
      emptyTitle="No Students Found"
      emptyDescription="Registered students will appear here automatically when they sign up in the Borrow mobile application."
    />
  );
};

export default StudentTable;
