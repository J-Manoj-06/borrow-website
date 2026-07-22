import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { useRBAC } from '../../hooks/useRBAC';
import { SYSTEM_ROLES } from '../../models/rbacModel';

export const AdminDialog = ({ open, onClose }) => {
  const { editingAdmin, createAdmin, updateAdmin } = useRBAC();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: '',
      employeeId: '',
      email: '',
      phone: '',
      department: 'Central University Library',
      role: SYSTEM_ROLES.LIBRARIAN,
      status: 'Active',
      notes: '',
    },
  });

  useEffect(() => {
    if (editingAdmin) {
      reset({
        fullName: editingAdmin.fullName || '',
        employeeId: editingAdmin.employeeId || '',
        email: editingAdmin.email || '',
        phone: editingAdmin.phone || '',
        department: editingAdmin.department || 'Central University Library',
        role: editingAdmin.role || SYSTEM_ROLES.LIBRARIAN,
        status: editingAdmin.status || 'Active',
        notes: editingAdmin.notes || '',
      });
    } else {
      reset({
        fullName: '',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        email: '',
        phone: '',
        department: 'Central University Library',
        role: SYSTEM_ROLES.LIBRARIAN,
        status: 'Active',
        notes: '',
      });
    }
  }, [editingAdmin, reset, open]);

  const onSubmit = (data) => {
    if (editingAdmin) {
      updateAdmin(editingAdmin.id, data);
    } else {
      createAdmin(data);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={editingAdmin ? 'Edit Administrator Profile' : 'Add New Administrator Account'}
      subtitle={editingAdmin ? 'Update system role, department, or status.' : 'Register a new librarian or administrator to grant portal access.'}
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
            {editingAdmin ? 'Save Changes' : 'Create Admin Account'}
          </CustomButton>
        </>
      }
    >
      <Box sx={{ pt: 1 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="fullName"
              control={control}
              rules={{ required: 'Full name is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} fullWidth label="Full Name *" error={!!error} helperText={error?.message} />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="employeeId"
              control={control}
              rules={{ required: 'Employee ID is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField {...field} fullWidth label="Employee / Admin ID *" error={!!error} helperText={error?.message} />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              rules={{ required: 'Email is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="email"
                  label="Official Email Address *"
                  disabled={!!editingAdmin}
                  error={!!error}
                  helperText={error?.message || (editingAdmin ? 'Firebase email cannot be changed' : '')}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <TextField {...field} fullWidth label="Phone Number" />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="System Role *">
                  <MenuItem value={SYSTEM_ROLES.SUPER_ADMIN}>Super Admin (Full Access)</MenuItem>
                  <MenuItem value={SYSTEM_ROLES.LIBRARY_ADMIN}>Library Administrator</MenuItem>
                  <MenuItem value={SYSTEM_ROLES.LIBRARIAN}>Librarian (Circulation Only)</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Account Status *">
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Disabled">Disabled</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => <TextField {...field} fullWidth label="Assigned Department Section" />}
            />
          </Grid>
        </Grid>
      </Box>
    </CustomDialog>
  );
};

export default AdminDialog;
