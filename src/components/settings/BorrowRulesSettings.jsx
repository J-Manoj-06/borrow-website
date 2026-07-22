import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';

export const BorrowRulesSettings = () => {
  const { borrowRules, updateBorrowRules } = useSettings();

  const { control, handleSubmit } = useForm({
    defaultValues: borrowRules,
  });

  const onSubmit = (data) => {
    updateBorrowRules(data);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Borrow Loan & Checkout Rules
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure standard loan periods, student book limits, renewal limits, and reservation rules.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="defaultBorrowDuration"
            control={control}
            rules={{ min: 1, max: 365 }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Default Loan Period (Days) *"
                helperText="Applied automatically during book checkouts (1 - 365 days)"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="maxBooksPerStudent"
            control={control}
            rules={{ min: 1, max: 20 }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Max Books Per Student *"
                helperText="Maximum physical books a student can hold concurrently"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="maxActiveRequests"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Max Active Pending Requests *"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="gracePeriod"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Overdue Grace Period (Days)"
                helperText="Buffer days before overdue warning chips activate"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="renewalLimit"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Loan Renewal Extension Limit"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="reservationDuration"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Pickup Reservation Duration (Days)"
              />
            )}
          />
        </Grid>

        {/* Toggles */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Controller
              name="allowRenewals"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} color="primary" />}
                  label="Allow students to request loan renewals via mobile app"
                />
              )}
            />

            <Controller
              name="allowReservations"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} color="primary" />}
                  label="Allow reserving books out of stock"
                />
              )}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
          Save Loan Rules
        </CustomButton>
      </Box>
    </Box>
  );
};

export default BorrowRulesSettings;
