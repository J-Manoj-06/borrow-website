import { useContext } from 'react';
import { QRCodeContext } from '../contexts/QRCodeContext';

export const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};

export default useQRCode;
