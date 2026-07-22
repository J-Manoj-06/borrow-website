import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import GetAppIcon from '@mui/icons-material/GetApp';
import toast from 'react-hot-toast';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('Thank you for installing Borrow Library Admin Portal!');
    }
    setDeferredPrompt(null);
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity="info"
        variant="filled"
        onClose={() => setOpen(false)}
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={<GetAppIcon />}
            onClick={handleInstallClick}
            sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
          >
            Install App
          </Button>
        }
        sx={{ borderRadius: '14px', fontWeight: 700, backgroundColor: '#2563EB' }}
      >
        Install Borrow Admin Portal as a Desktop App!
      </Alert>
    </Snackbar>
  );
};

export default PWAInstallPrompt;
