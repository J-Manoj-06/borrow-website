import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import format from 'date-fns/format';
import CustomTable, { StatusChip } from '../common/CustomTable';
import { useRBAC } from '../../hooks/useRBAC';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { SYSTEM_ROLES, PERMISSION_MODULES, PERMISSION_ACTIONS } from '../../models/rbacModel';
import ProtectedPermission from '../rbac/ProtectedPermission';

export const AdminTable = () => {
  const {
    admins,
    loading,
    selectAdminForProfile,
    openEditAdminDialog,
    deleteAdmin,
    resetPasswordEmail,
  } = useRBAC();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const columns = [
    {
      id: 'fullName',
      label: 'Administrator Member',
      minWidth: 220,
      format: (val, row) => (
        <Box
          onClick={() => selectAdminForProfile(row)}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
        >
          <Avatar
            src={row.avatarUrl || ''}
            alt={val}
            sx={{ width: 40, height: 40, bgcolor: BORROW_COLORS.primary, fontWeight: 700 }}
          >
            {val[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
              {val}
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700 }}>
              ID: {row.employeeId || row.adminId}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'System Role',
      minWidth: 170,
      format: (val) => (
        <Chip
          label={val}
          size="small"
          sx={{
            backgroundColor: val === SYSTEM_ROLES.SUPER_ADMIN
              ? '#F3E8FF'
              : val === SYSTEM_ROLES.LIBRARY_ADMIN
              ? BORROW_COLORS.primaryLight
              : BORROW_COLORS.warningLight,
            color: val === SYSTEM_ROLES.SUPER_ADMIN
              ? '#8B5CF6'
              : val === SYSTEM_ROLES.LIBRARY_ADMIN
              ? '#FFFFFF'
              : BORROW_COLORS.warning,
            fontWeight: 800,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      id: 'department',
      label: 'Department & Contact',
      minWidth: 220,
      format: (val, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {val}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      format: (val) => <StatusChip status={val || 'Active'} />,
    },
    {
      id: 'lastLogin',
      label: 'Last Login',
      minWidth: 150,
      format: (val) => (
        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, fontWeight: 600 }}>
          {val ? format(new Date(val), 'dd MMM yyyy, hh:mm a') : 'Never'}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 130,
      align: 'right',
      format: (_, row) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          <Tooltip title="View Admin Profile & Permissions">
            <IconButton size="small" onClick={() => selectAdminForProfile(row)} sx={{ color: BORROW_COLORS.primary }}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <ProtectedPermission module={PERMISSION_MODULES.ADMINS} action={PERMISSION_ACTIONS.EDIT}>
            <Tooltip title="Edit Profile & Assign Role">
              <IconButton size="small" onClick={() => openEditAdminDialog(row)} sx={{ color: BORROW_COLORS.textSecondary }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ProtectedPermission>

          <ProtectedPermission module={PERMISSION_MODULES.ADMINS} action={PERMISSION_ACTIONS.EDIT}>
            <Tooltip title="Reset Password Email">
              <IconButton size="small" onClick={() => resetPasswordEmail(row.email)} sx={{ color: BORROW_COLORS.warning }}>
                <LockResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ProtectedPermission>

          <ProtectedPermission module={PERMISSION_MODULES.ADMINS} action={PERMISSION_ACTIONS.DELETE}>
            <Tooltip title="Delete Admin Account">
              <IconButton size="small" onClick={() => deleteAdmin(row.id)} sx={{ color: BORROW_COLORS.error }}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ProtectedPermission>
        </Box>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={admins}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(_, newPage) => setPage(newPage)}
      onRowsPerPageChange={(e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
      }}
      emptyType="students"
      emptyTitle="No Administrators Found"
      emptyDescription="Create administrator and librarian accounts to assign system roles."
    />
  );
};

export default AdminTable;
