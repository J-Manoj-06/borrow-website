import { useContext } from 'react';
import { BorrowRequestContext } from '../contexts/BorrowRequestContext';

export const usePendingBorrowRequests = () => {
  const context = useContext(BorrowRequestContext);
  const pendingCount = context?.stats?.pendingRequests || 0;
  const requests = context?.requests || [];

  return {
    pendingCount,
    requests,
    loading: context?.loading || false,
  };
};

export default usePendingBorrowRequests;
