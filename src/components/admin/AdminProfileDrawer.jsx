import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { DEFAULT_ROLE_PERMISSIONS } from '../../models/rbacModel';

export const AdminProfileDrawer = ({ open, onClose, admin }) => {
  if (!admin) return null;

  const permissionsObj = DEFAULT_ROLE_PERMISSIONS[admin.role] || {};

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          p: 3,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Admin Profile & Permissions
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Admin Profile Card */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, borderRadius: '16px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}`, mb: 3 }}>
        <Avatar src={admin.avatarUrl || ''} sx={{ width: 64, height: 64, bgcolor: BORROW_COLORS.primary, fontWeight: 800, fontSize: '1.5rem' }}>
          {(admin.fullName || 'A')[0]}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {admin.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 800, display: 'block', mb: 0.5 }}>
            ID: {admin.employeeId || admin.adminId}
          </Typography>
          <Chip label={admin.role} size="small" color="primary" sx={{ fontWeight: 800, height: 22, fontSize: '0.7rem' }} />
        </Box>
      </Box>

      {/* Account Info Details */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>Email Address:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{admin.email}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>Department:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{admin.department}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>Account Status:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.success }}>{admin.status || 'Active'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>Last Active Login:</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {admin.lastLogin ? format(new Date(admin.lastLogin), 'dd MMM yyyy, hh:mm a') : 'Never'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Assigned Module Permissions List */}
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, mb: 1.5 }}>
        ASSIGNED MODULE PERMISSIONS ({Object.keys(permissionsObj).length})
      </Typography>

      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Object.entries(permissionsObj).map(([moduleName, actions]) => (
          <ListItem
            key={moduleName}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: `1px solid ${BORROW_COLORS.border}`,
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: BORROW_COLORS.success, fontSize: 18 }} />
              <ListItemText primary={moduleName} primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 800 }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {actions.length === 0 ? (
                <Chip label="No Access" size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
              ) : (
                actions.map((act) => (
                  <Chip key={act} label={act} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem', textTransform: 'capitalize' }} />
                ))
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminProfileDrawer;
