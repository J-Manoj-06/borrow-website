import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import SaveIcon from '@mui/icons-material/Save';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../common/CustomButton';
import toast from 'react-hot-toast';

export const ProfileSettings = () => {
  const { user, adminProfile, role, updateProfile, changePassword } = useAuth();

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: adminProfile?.fullName || user?.displayName || '',
      email: adminProfile?.email || user?.email || '',
      phone: adminProfile?.phone || '',
      department: adminProfile?.department || 'Central University Library',
      avatarUrl: adminProfile?.avatarUrl || user?.photoURL || '',
    },
  });

  const onSaveProfile = async (data) => {
    try {
      await updateProfile({
        fullName: data.fullName,
        phone: data.phone,
        department: data.department,
        avatarUrl: data.avatarUrl,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onChangePassword = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Administrator Profile & Security Credentials
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your authenticated librarian admin account information, phone number, profile photo, and password.
        </Typography>
      </Box>

      {/* Admin Card */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2.5,
          p: 2.5,
          borderRadius: '16px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
        }}
      >
        <Avatar
          src={adminProfile?.avatarUrl || user?.photoURL || ''}
          alt={adminProfile?.fullName || user?.displayName || 'Admin'}
          sx={{ width: 64, height: 64, bgcolor: '#2563EB', fontWeight: 800, fontSize: '1.5rem' }}
        >
          {(adminProfile?.fullName || user?.displayName || user?.email || 'A')[0].toUpperCase()}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {adminProfile?.fullName || user?.displayName || 'Librarian Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700, display: 'block' }}>
            System Role: {adminProfile?.role || role || 'Librarian'} • Status: <strong>{adminProfile?.status || 'Active'}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Last Login: {adminProfile?.lastLogin ? new Date(adminProfile.lastLogin).toLocaleString() : 'Just Now'} ({adminProfile?.loginDevice || 'Web Desktop'})
          </Typography>
        </Box>
      </Box>

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSaveProfile)} noValidate>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="fullName"
              control={control}
              rules={{ required: 'Full name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name *"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth disabled label="Email Address (Firebase Auth ID)" />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => <TextField {...field} fullWidth label="Contact Phone Number" placeholder="+1 (555) 000-0000" />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="department"
              control={control}
              render={({ field }) => <TextField {...field} fullWidth label="Department / Division" />}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="avatarUrl"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Profile Photo URL" placeholder="https://images.unsplash.com/..." />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <CustomButton type="submit" variant="contained" startIcon={<SaveIcon />}>
            Save Profile Changes
          </CustomButton>
        </Box>
      </form>

      <Divider sx={{ my: 1 }} />

      {/* Change Password Section */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Change Firebase Auth Password
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Update your secure sign-in password for the Borrow Admin Portal.
        </Typography>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              placeholder="••••••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="password"
              label="Confirm New Password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <CustomButton
            variant="outlined"
            startIcon={<LockResetIcon />}
            loading={passwordLoading}
            onClick={onChangePassword}
          >
            Update Password
          </CustomButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
