import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useForm, Controller } from 'react-hook-form';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useNotifications } from '../../hooks/useNotifications';

export const CreateAnnouncementDialog = ({ open, onClose }) => {
  const { createAnnouncement } = useNotifications();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'General Library',
      pinned: true,
      expiryDate: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (data) => {
    await createAnnouncement(data);
    reset();
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Create Pinned Mobile Announcement"
      subtitle="Publish rich library announcements pinned to the top of the Borrow mobile application feed."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            startIcon={<CampaignIcon />}
            onClick={handleSubmit(onSubmit)}
          >
            Publish Announcement
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Title is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              label="Announcement Title *"
              placeholder="e.g. Mid-Semester Exam Extended Library Hours"
              error={!!error}
              helperText={error?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{ required: 'Description is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              label="Detailed Announcement Content *"
              placeholder="Enter announcement description..."
              error={!!error}
              helperText={error?.message}
            />
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label="Announcement Category *">
                <MenuItem value="General Library">General Library</MenuItem>
                <MenuItem value="Library Schedule">Library Schedule</MenuItem>
                <MenuItem value="New Arrivals">New Arrivals</MenuItem>
                <MenuItem value="Exam Special">Exam Special</MenuItem>
                <MenuItem value="Emergency">Emergency Notice</MenuItem>
              </TextField>
            )}
          />

          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        </Box>

        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Banner Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
            />
          )}
        />

        <Controller
          name="pinned"
          control={control}
          render={({ field }) => (
            <Box sx={{ p: 1.5, borderRadius: '12px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
              <FormControlLabel
                control={<Switch {...field} checked={field.value} color="primary" />}
                label="Pin to top of student mobile home feed"
              />
            </Box>
          )}
        />
      </Box>
    </CustomDialog>
  );
};

export default CreateAnnouncementDialog;
