import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import {
  SYSTEM_ROLES,
  PERMISSION_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
} from '../../models/rbacModel';

export const PermissionMatrix = ({ open, onClose }) => {
  const modulesList = Object.values(PERMISSION_MODULES);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 680 },
          p: 3,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Role Permission Matrix Visualizer
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Module-by-module permission rights across Super Admin, Library Admin, and Librarian.
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORROW_COLORS.border}`, borderRadius: '16px' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Module Name</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Super Admin</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Library Admin</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800 }}>Librarian</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modulesList.map((mod) => {
              const superActs = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.SUPER_ADMIN][mod] || [];
              const adminActs = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.LIBRARY_ADMIN][mod] || [];
              const libActs = DEFAULT_ROLE_PERMISSIONS[SYSTEM_ROLES.LIBRARIAN][mod] || [];

              return (
                <TableRow key={mod} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{mod}</TableCell>

                  <TableCell align="center">
                    <Chip label={superActs.join(', ')} size="small" color="primary" sx={{ fontSize: '0.65rem', height: 20 }} />
                  </TableCell>

                  <TableCell align="center">
                    {adminActs.length > 0 ? (
                      <Chip label={adminActs.join(', ')} size="small" color="info" sx={{ fontSize: '0.65rem', height: 20 }} />
                    ) : (
                      <ClearIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                    )}
                  </TableCell>

                  <TableCell align="center">
                    {libActs.length > 0 ? (
                      <Chip label={libActs.join(', ')} size="small" color="warning" sx={{ fontSize: '0.65rem', height: 20 }} />
                    ) : (
                      <ClearIcon fontSize="small" sx={{ color: BORROW_COLORS.textSecondary }} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Drawer>
  );
};

export default PermissionMatrix;
