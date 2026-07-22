import { useContext } from 'react';
import { GlobalSearchContext } from '../contexts/GlobalSearchContext';

export const useGlobalSearch = () => {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
};

export default useGlobalSearch;
