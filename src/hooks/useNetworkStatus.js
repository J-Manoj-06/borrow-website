import { useState, useEffect } from 'react';
import { getOfflineQueue } from '../services/offlineQueueService';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setQueueSize(getOfflineQueue().length);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setQueueSize(getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setQueueSize(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    queueSize,
    isSyncing,
    setIsSyncing,
  };
};

export default useNetworkStatus;
