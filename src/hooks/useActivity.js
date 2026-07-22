import { useContext } from 'react';
import { ActivityContext } from '../contexts/ActivityContext';

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export default useActivity;
