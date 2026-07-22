import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { StatusChip } from '../common/CustomTable';

export const ActivityDrawer = ({ open, onClose, activity }) => {
  if (!activity) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 540 },
          p: 0,
          backgroundColor: BORROW_COLORS.surface,
        },
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${BORROW_COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon sx={{ color: BORROW_COLORS.primary }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary }}>
            Audit Log Details
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: BORROW_COLORS.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Drawer Content */}
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1, overflowY: 'auto' }}>
        {/* Banner */}
        <Box sx={{ p: 2.5, borderRadius: '16px', backgroundColor: '#F8FAFC', border: `1px solid ${BORROW_COLORS.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip label={activity.activityType} color="primary" sx={{ fontWeight: 800 }} />
            <StatusChip status={activity.status || 'Success'} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
            {activity.affectedDocumentName}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 700, fontFamily: 'monospace' }}>
            ID: {activity.affectedDocumentId}
          </Typography>
        </Box>

        {/* Metadata Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.surface }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>PERFORMED BY</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{activity.performedBy}</Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>{activity.adminEmail}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.surface }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>TIMESTAMP</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {activity.createdAt ? format(new Date(activity.createdAt), 'dd MMM yyyy') : 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                {activity.createdAt ? format(new Date(activity.createdAt), 'hh:mm:ss a') : ''}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.surface }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>MODULE</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{activity.module}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.surface }}>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>ORIGIN IP & DEVICE</Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{activity.ipAddress}</Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Data Diff (Old vs New Values) */}
        {(activity.oldData || activity.newData) && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: BORROW_COLORS.textSecondary, mb: 1 }}>
              RECORD DATA MODIFICATIONS (DIFF)
            </Typography>

            <Grid container spacing={2}>
              {activity.oldData && (
                <Grid item xs={6}>
                  <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#FEF2F2', border: `1px solid ${BORROW_COLORS.errorLight}` }}>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 800, mb: 0.5, display: 'block' }}>
                      OLD VALUES BEFORE
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(activity.oldData, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              )}

              {activity.newData && (
                <Grid item xs={activity.oldData ? 6 : 12}>
                  <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: '#F0FDF4', border: `1px solid ${BORROW_COLORS.successLight}` }}>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.success, fontWeight: 800, mb: 0.5, display: 'block' }}>
                      NEW VALUES AFTER
                    </Typography>
                    <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(activity.newData, null, 2)}
                    </pre>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default ActivityDrawer;
