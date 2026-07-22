import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';

export const ReturnRulesSettings = () => {
  const { returnRules, updateReturnRules } = useSettings();

  const { control, handleSubmit } = useForm({
    defaultValues: returnRules,
  });

  const onSubmit = (data) => {
    updateReturnRules(data);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Return Rules & Fine Policies
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure return reminder frequency, damaged/lost book policies, and fine system calculation.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="overdueReminderDays"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label="Days Before Due Date for Reminder *"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="returnReminderFrequency"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Return Reminder Frequency">
                <MenuItem value="Daily">Daily Notifications</MenuItem>
                <MenuItem value="Every 2 Days">Every 2 Days</MenuItem>
                <MenuItem value="Weekly">Weekly Digest</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="damagedBookWorkflow"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Damaged Book Workflow">
                <MenuItem value="Assess Fine & Repair">Assess Fine & Repair</MenuItem>
                <MenuItem value="Replace Copy">Require Replacement Copy</MenuItem>
                <MenuItem value="Log Note Only">Log Note Only</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="lostBookWorkflow"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Lost Book Workflow">
                <MenuItem value="Charge Replacement Cost">Charge Full Replacement Cost</MenuItem>
                <MenuItem value="Freeze Student Account">Freeze Student Account</MenuItem>
              </TextField>
            )}
          />
        </Grid>

        {/* Fine Toggle System */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, borderRadius: '14px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Controller
              name="enableFineCalculation"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} color="primary" />}
                  label="Enable Automatic Daily Overdue Fine Calculation (Default OFF for pilot)"
                />
              )}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
          Save Return Policies
        </CustomButton>
      </Box>
    </Box>
  );
};

export default ReturnRulesSettings;
