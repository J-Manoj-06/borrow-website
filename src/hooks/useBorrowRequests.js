import { useContext } from 'react';
import { BorrowRequestContext } from '../contexts/BorrowRequestContext';

export const useBorrowRequests = () => {
  const context = useContext(BorrowRequestContext);
  if (!context) {
    throw new Error('useBorrowRequests must be used within a BorrowRequestProvider');
  }
  return context;
};

export default useBorrowRequests;
