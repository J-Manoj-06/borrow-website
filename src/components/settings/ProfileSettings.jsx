import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import CustomButton from '../common/CustomButton';
import toast from 'react-hot-toast';

export const ProfileSettings = () => {
  const { user } = useAuth();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      fullName: user?.displayName || 'Lead Librarian Admin',
      email: user?.email || 'admin@borrow.com',
      phone: '+1 (555) 019-2834',
    },
  });

  const onSubmit = () => {
    toast.success('Updated administrator profile credentials!');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Administrator Profile & Credentials
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage authenticated librarian admin account information.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 2.5, borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
        <Avatar
          src={user?.photoURL || ''}
          alt={user?.displayName || 'Admin'}
          sx={{ width: 64, height: 64, bgcolor: '#2563EB', fontWeight: 800, fontSize: '1.5rem' }}
        >
          {(user?.displayName || 'A')[0]}
        </Avatar>

        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {user?.displayName || 'Lead Librarian Admin'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 700 }}>
            Role: Super Administrator
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Full Name *" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth disabled label="Email Address (Firebase Auth)" />}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label="Contact Phone Number" />}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
          Save Profile
        </CustomButton>
      </Box>
    </Box>
  );
};

export default ProfileSettings;
