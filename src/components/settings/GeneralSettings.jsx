import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { useForm, Controller } from 'react-hook-form';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';
import SaveIcon from '@mui/icons-material/Save';

export const GeneralSettings = () => {
  const { general, updateGeneralSettings } = useSettings();

  const { control, handleSubmit } = useForm({
    defaultValues: general,
  });

  const onSubmit = (data) => {
    updateGeneralSettings(data);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          General Library Information
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure institutional identity, address, contact details, and operating hours.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="libraryName"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Library Name *" />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="collegeName"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="University / College Name *" />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Official Library Email *" />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Helpdesk Phone Number" />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Physical Campus Address" multiline rows={2} />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="website"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Library Portal Website" />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="workingHours"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label="Library Operating Hours" />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
          Save General Info
        </CustomButton>
      </Box>
    </Box>
  );
};

export default GeneralSettings;
