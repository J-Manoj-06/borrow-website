import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Chip from '@mui/material/Chip';
import SendIcon from '@mui/icons-material/Send';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useForm, Controller } from 'react-hook-form';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { NOTIFICATION_TYPES, RECIPIENT_TARGETS, NOTIFICATION_PRIORITIES } from '../../models/notificationModel';
import { useNotifications } from '../../hooks/useNotifications';

export const CreateNotificationDialog = ({ open, onClose }) => {
  const { sendNotification, setTemplateDialogOpen, activeTemplate, setActiveTemplate } = useNotifications();

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      message: '',
      type: NOTIFICATION_TYPES.GENERAL,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      recipientTarget: RECIPIENT_TARGETS.ALL_STUDENTS,
      scheduleLater: false,
      scheduledDateTime: '',
    },
  });

  const watchTitle = watch('title');
  const watchMessage = watch('message');
  const watchType = watch('type');
  const watchPriority = watch('priority');
  const watchScheduleLater = watch('scheduleLater');

  useEffect(() => {
    if (activeTemplate) {
      setValue('title', activeTemplate.title);
      setValue('message', activeTemplate.message);
      setValue('type', activeTemplate.type);
      setValue('priority', activeTemplate.priority);
      setValue('recipientTarget', activeTemplate.recipientTarget || RECIPIENT_TARGETS.ALL_STUDENTS);
    }
  }, [activeTemplate, setValue]);

  const onSubmit = async (data) => {
    await sendNotification(data);
    reset();
    setActiveTemplate(null);
  };

  return (
    <CustomDialog
      open={open}
      onClose={() => {
        onClose();
        setActiveTemplate(null);
      }}
      title="Create & Dispatch Push Notification"
      subtitle="Broadcast notifications or targeted alerts to Borrow mobile app users in real time."
      maxWidth="md"
      actions={
        <>
          <CustomButton
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setTemplateDialogOpen(true)}
          >
            Use Template
          </CustomButton>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            startIcon={<SendIcon />}
            onClick={handleSubmit(onSubmit)}
          >
            {watchScheduleLater ? 'Schedule Notification' : 'Send Push Now'}
          </CustomButton>
        </>
      }
    >
      <Grid container spacing={3} sx={{ pt: 1 }}>
        {/* Left Column: Form Composition Controls */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Title */}
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Notification title is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Notification Title *"
                  placeholder="e.g. Return Reminder: Clean Code"
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Message Body */}
            <Controller
              name="message"
              control={control}
              rules={{ required: 'Notification message is required' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Notification Body Message *"
                  placeholder="Enter message content displayed on student mobile device screens..."
                  error={!!error}
                  helperText={error?.message}
                />
              )}
            />

            {/* Type & Priority */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Notification Category *">
                      {Object.values(NOTIFICATION_TYPES).map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth label="Priority Level *">
                      {Object.values(NOTIFICATION_PRIORITIES).map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            {/* Recipient Audience Target */}
            <Controller
              name="recipientTarget"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Audience Recipients Target *">
                  {Object.values(RECIPIENT_TARGETS).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Schedule Toggle */}
            <Controller
              name="scheduleLater"
              control={control}
              render={({ field }) => (
                <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} color="primary" />}
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Schedule for Later Dispatch
                      </Typography>
                    }
                  />

                  {field.value && (
                    <Box sx={{ mt: 2 }}>
                      <Controller
                        name="scheduledDateTime"
                        control={control}
                        render={({ field: dateField }) => (
                          <TextField
                            {...dateField}
                            fullWidth
                            type="datetime-local"
                            label="Target Date & Time"
                            InputLabelProps={{ shrink: true }}
                          />
                        )}
                      />
                    </Box>
                  )}
                </Box>
              )}
            />
          </Box>
        </Grid>

        {/* Right Column: Live Device Lockscreen Preview */}
        <Grid item xs={12} md={5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textSecondary }}>
            LIVE MOBILE APP PREVIEW
          </Typography>

          <Box
            sx={{
              p: 2.5,
              borderRadius: '24px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Phone Top Notch Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>9:41 AM</Typography>
              <PhoneIphoneIcon fontSize="small" />
            </Box>

            {/* Mobile Notification Card Popup */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '5px', backgroundColor: BORROW_COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: '#FFF', fontSize: '0.65rem' }}>B</Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#93C5FD' }}>
                    BORROW MOBILE APP
                  </Typography>
                </Box>
                <Chip
                  label={watchPriority}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    backgroundColor: watchPriority === 'Urgent' ? '#EF4444' : '#2563EB',
                    color: '#FFF',
                  }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 0.5 }}>
                {watchTitle || 'Notification Title Preview'}
              </Typography>

              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', lineHeight: 1.5 }}>
                {watchMessage || 'Body message text will render here on student mobile device lockscreens...'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </CustomDialog>
  );
};

export default CreateNotificationDialog;
