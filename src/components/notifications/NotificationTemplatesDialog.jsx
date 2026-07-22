import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { NOTIFICATION_TEMPLATES } from '../../models/notificationModel';
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationTemplatesDialog = ({ open, onClose }) => {
  const { applyTemplate } = useNotifications();

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Notification Message Templates"
      subtitle="Select a pre-configured library message template for 1-click composition."
      maxWidth="md"
      actions={
        <CustomButton variant="outlined" onClick={onClose}>
          Close
        </CustomButton>
      }
    >
      <Grid container spacing={2} sx={{ pt: 1 }}>
        {NOTIFICATION_TEMPLATES.map((tpl) => (
          <Grid item xs={12} sm={6} key={tpl.id}>
            <Box
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: BORROW_COLORS.surface,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: BORROW_COLORS.primary,
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)',
                },
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip label={tpl.type} size="small" color="primary" sx={{ fontWeight: 700 }} />
                  <Chip label={tpl.priority} size="small" variant="outlined" />
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 1 }}>
                  {tpl.title}
                </Typography>

                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 2, lineHeight: 1.5 }}>
                  "{tpl.message}"
                </Typography>
              </Box>

              <CustomButton
                fullWidth
                variant="outlined"
                startIcon={<AutoAwesomeIcon />}
                onClick={() => applyTemplate(tpl)}
              >
                Use Template
              </CustomButton>
            </Box>
          </Grid>
        ))}
      </Grid>
    </CustomDialog>
  );
};

export default NotificationTemplatesDialog;
