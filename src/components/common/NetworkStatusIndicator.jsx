import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import SyncIcon from '@mui/icons-material/Sync';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { BORROW_COLORS } from '../../theme/borrowTheme';

export const NetworkStatusIndicator = () => {
  const { isOnline, queueSize, isSyncing } = useNetworkStatus();

  if (isOnline && queueSize === 0 && !isSyncing) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            borderRadius: '30px',
            backgroundColor: !isOnline ? '#1E293B' : BORROW_COLORS.primary,
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
            border: `1.5px solid ${!isOnline ? '#F59E0B' : '#60A5FA'}`,
          }}
        >
          {!isOnline ? (
            <>
              <WifiOffIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Working Offline ({queueSize} actions queued)
              </Typography>
            </>
          ) : (
            <>
              <SyncIcon sx={{ color: '#FFFFFF', fontSize: 20, animation: 'spin 1.5s linear infinite' }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Syncing {queueSize} queued actions...
              </Typography>
            </>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default NetworkStatusIndicator;
