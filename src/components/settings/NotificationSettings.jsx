import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import SaveIcon from '@mui/icons-material/Save';
import { useForm, Controller } from 'react-hook-form';
import { useSettings } from '../../hooks/useSettings';
import CustomButton from '../common/CustomButton';

export const NotificationSettings = () => {
  const { notifications, updateNotificationSettings } = useSettings();

  const { control, handleSubmit } = useForm({
    defaultValues: notifications,
  });

  const onSubmit = (data) => {
    updateNotificationSettings(data);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Notification Delivery Preferences
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Configure broadcast notifications, automated return reminders, and mobile push defaults.
        </Typography>
      </Box>

      <Box sx={{ p: 2.5, borderRadius: '16px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="enablePushNotifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} color="primary" />}
              label="Enable Firebase Cloud Messaging Push Notifications (Mobile App)"
            />
          )}
        />

        <Controller
          name="returnReminders"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} color="primary" />}
              label="Automatically dispatch return deadline reminders"
            />
          )}
        />

        <Controller
          name="overdueAlerts"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} color="primary" />}
              label="Automatically dispatch urgent overdue alerts"
            />
          )}
        />

        <Controller
          name="announcementNotifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} color="primary" />}
              label="Notify mobile users when new announcements are published"
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <CustomButton variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
          Save Preferences
        </CustomButton>
      </Box>
    </Box>
  );
};

export default NotificationSettings;
