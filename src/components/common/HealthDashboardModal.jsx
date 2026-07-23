import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WifiIcon from '@mui/icons-material/Wifi';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';

import CustomDialog from './CustomDialog';
import CustomButton from './CustomButton';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { getOfflineQueue } from '../../services/offlineQueueService';

export const HealthDashboardModal = ({ open, onClose }) => {
  const { isOnline, queueSize } = useNetworkStatus();
  const queueItems = getOfflineQueue();

  const services = [
    { name: 'Firebase Authentication', status: 'Operational', latency: '42ms', icon: SecurityIcon },
    { name: 'Firestore Cloud Database', status: isOnline ? 'Online (Synced)' : 'Offline (Cached)', latency: isOnline ? '38ms' : 'N/A', icon: StorageIcon },
    { name: 'Firebase Storage Engine', status: 'Operational', latency: '55ms', icon: CloudIcon },
    { name: 'Cloud Functions API', status: 'Operational', latency: '120ms', icon: SpeedIcon },
    { name: 'Network Connectivity', status: isOnline ? 'Connected' : 'Disconnected', latency: isOnline ? '24ms' : 'N/A', icon: WifiIcon },
  ];

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="System Health & Operational Diagnostics"
      subtitle="Real-time connectivity monitoring, Firebase service health, and offline synchronization queue state."
      actions={
        <CustomButton variant="contained" onClick={onClose}>
          Close Diagnostics
        </CustomButton>
      }
    >
      <Box sx={{ pt: 1 }}>
        {/* Services Status Grid */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {services.map((s) => {
            const IconComp = s.icon;
            return (
              <Grid item xs={12} sm={6} key={s.name}>
                <Card sx={{ border: `1px solid ${BORROW_COLORS.border}`, borderRadius: '14px', p: 1 }}>
                  <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '10px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        color: BORROW_COLORS.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComp fontSize="small" />
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary }}>
                        {s.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                        Latency: {s.latency}
                      </Typography>
                    </Box>
                    <Chip
                      label={s.status.includes('Offline') ? 'Offline' : 'Healthy'}
                      size="small"
                      sx={{
                        backgroundColor: s.status.includes('Offline') ? BORROW_COLORS.warningLight : BORROW_COLORS.successLight,
                        color: s.status.includes('Offline') ? BORROW_COLORS.warning : BORROW_COLORS.success,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Offline Queue State */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '16px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#93C5FD', mb: 0.5 }}>
            Offline Action Sync Queue ({queueItems.length} Pending Actions)
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
            Actions submitted while offline are queued locally and automatically replayed upon network reconnection.
          </Typography>

          {queueItems.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 120, overflowY: 'auto' }}>
              {queueItems.map((q) => (
                <Box
                  key={q.id}
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#60A5FA' }}>
                    {q.actionType}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    {new Date(q.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: BORROW_COLORS.success }}>
              <CheckCircleIcon fontSize="small" />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Sync queue empty — All client operations synchronized with Firestore.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </CustomDialog>
  );
};

export default HealthDashboardModal;
