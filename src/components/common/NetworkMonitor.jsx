import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import useNetworkStatus from '../../hooks/useNetworkStatus';

export const NetworkMonitor = () => {
  const isOnline = useNetworkStatus();

  return (
    <Snackbar
      open={!isOnline}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ top: { xs: 8, sm: 16 } }}
    >
      <Alert severity="warning" variant="filled" sx={{ width: '100%', fontWeight: 700, borderRadius: '12px' }}>
        Network Connection Lost — Running in Offline Mode with Firestore Persistence
      </Alert>
    </Snackbar>
  );
};

export default NetworkMonitor;
