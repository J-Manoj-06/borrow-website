import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export const useUnreadNotifications = () => {
  const context = useContext(NotificationContext);
  const unreadCount = context?.stats?.unreadCount || 0;
  const notifications = context?.notifications || [];
  const markAsRead = context?.markAsRead;

  return {
    unreadCount,
    notifications,
    markAsRead,
    loading: context?.loading || false,
  };
};

export default useUnreadNotifications;
