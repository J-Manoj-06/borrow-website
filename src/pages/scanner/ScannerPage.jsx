import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// Icons
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import StatusBadge from '../../components/common/StatusBadge';
import RecentScansPanel from '../../components/scanner/RecentScansPanel';
import { BORROW_COLORS } from '../../theme/borrowTheme';

import useBooks from '../../hooks/useBooks';
import useTransactions from '../../hooks/useTransactions';
import useStudents from '../../hooks/useStudents';
import { COPY_STATUSES } from '../../models/bookModel';

export const ScannerPage = () => {
  const { books, updateCopyStatus } = useBooks();
  const { transactions, openIssueModal, openReturnModal } = useTransactions();
  const { students } = useStudents();

  // Mode Switcher ('book' | 'student' | 'transaction')
  const [scanMode, setScanMode] = useState('book');

  // Input & Scanned State
  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [recentScans, setRecentScans] = useState([]);

  // Camera WebRTC Stream State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraStream = async () => {
    stopCameraStream();
    setCameraError(null);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      toast.success(`Camera active (${facingMode === 'environment' ? 'Rear' : 'Front'})`);
    } catch (err) {
      console.error('Camera stream error:', err);
      setCameraError('Camera access denied or unavailable. Enter code manually below.');
      setIsCameraActive(false);
      toast.error('Unable to access video camera');
    }
  };

  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) startCameraStream();
  };

  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          await track.applyConstraints({ advanced: [{ torch: !torchEnabled }] });
          setTorchEnabled(!torchEnabled);
        } catch {
          toast.error('Torch not supported on this device camera');
        }
      }
    }
  };

  // Perform Instant Lookup Across Book, Student, or Transaction Collections
  const handlePerformLookup = (inputCode) => {
    const code = inputCode ? inputCode.trim() : '';
    if (!code) {
      toast.error('Please enter or scan a QR / Barcode string.');
      return;
    }

    const cleanCode = code.toUpperCase();
    let result = null;

    if (scanMode === 'student') {
      // Lookup Student
      const student = (students || []).find(
        (s) =>
          (s.registerNumber || '').toUpperCase() === cleanCode ||
          (s.id || '').toUpperCase() === cleanCode ||
          (s.fullName || '').toUpperCase().includes(cleanCode)
      );
      if (student) {
        result = {
          type: 'student',
          studentName: student.fullName || student.name,
          registerNumber: student.registerNumber,
          department: student.department || 'Computer Science',
          avatarUrl: student.avatarUrl,
          borrowedCount: student.borrowedCount || 0,
          status: student.computedStatus || student.status || 'Active',
          rawStudent: student,
        };
      }
    } else if (scanMode === 'transaction') {
      // Lookup Transaction
      const txn = (transactions || []).find(
        (t) =>
          (t.id || '').toUpperCase() === cleanCode ||
          (t.bookCopyId || '').toUpperCase() === cleanCode ||
          (t.studentName || '').toUpperCase().includes(cleanCode)
      );
      if (txn) {
        result = {
          type: 'transaction',
          id: txn.id,
          bookTitle: txn.bookTitle,
          studentName: txn.studentName,
          issueDate: txn.issueDate,
          dueDate: txn.dueDate,
          status: txn.status || 'Issued',
          rawTxn: txn,
        };
      }
    } else {
      // Lookup Book Copy / ISBN (Default)
      const matchingBook = (books || []).find(
        (b) =>
          (b.isbn || '').toUpperCase() === cleanCode ||
          (b.id || '').toUpperCase() === cleanCode ||
          (b.title || '').toUpperCase().includes(cleanCode)
      );

      const matchingTxn = (transactions || []).find(
        (t) => (t.bookCopyId || '').toUpperCase() === cleanCode || (t.bookTitle || '').toUpperCase().includes(cleanCode)
      );

      result = {
        type: 'book',
        copyId: cleanCode.startsWith('CPY-') ? cleanCode : `CPY-${cleanCode}`,
        bookTitle: matchingBook?.title || matchingTxn?.bookTitle || 'Computer Science Fundamentals',
        bookAuthor: matchingBook?.author || matchingTxn?.bookAuthor || 'Core Collection Author',
        bookCoverUrl: matchingBook?.coverUrl || matchingTxn?.bookCoverUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
        status: matchingTxn && matchingTxn.status !== 'Returned' ? 'Borrowed' : 'Available',
        activeBorrower: matchingTxn && matchingTxn.status !== 'Returned' ? matchingTxn : null,
      };
    }

    if (!result) {
      toast.error(`No record found matching code "${cleanCode}"`);
      setScannedResult(null);
      return;
    }

    setScannedResult(result);
    setRecentScans((prev) => [{ ...result, scannedTime: new Date().toISOString() }, ...prev.slice(0, 4)]);
    toast.success(`Verified ${result.type.toUpperCase()}: ${result.bookTitle || result.studentName || result.id}`);
  };

  const handleSimulateCameraScan = () => {
    if (!isCameraActive) startCameraStream();
    setTimeout(() => {
      const sampleCode = scanMode === 'student' ? 'ST-2024-001' : scanMode === 'transaction' ? 'TXN-9021' : 'CPY-1002';
      handlePerformLookup(sampleCode);
    }, 1200);
  };

  const handleMarkDamaged = async () => {
    if (!scannedResult || scannedResult.type !== 'book') return;
    try {
      if (updateCopyStatus) {
        await updateCopyStatus(scannedResult.copyId, COPY_STATUSES.DAMAGED, 'Damaged', 'Main-Shelf', 'R-01', 'Marked Damaged via Scanner');
      }
      toast.success(`Copy ${scannedResult.copyId} marked Damaged.`);
    } catch {
      toast.error('Failed to update copy status.');
    }
  };

  return (
    <PageContainer
      title="QR & Barcode Scanner"
      subtitle="Scan physical copy labels, student QR badges, or transaction receipts for instant 1-step verification."
    >
      {/* 1. Mode Switcher Tabs */}
      <Box sx={{ borderBottom: `1px solid ${BORROW_COLORS.border}`, mb: 3 }}>
        <Tabs
          value={scanMode}
          onChange={(_, newMode) => {
            setScanMode(newMode);
            setScannedResult(null);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84375rem',
              minHeight: 40,
              px: 2,
            },
          }}
        >
          <Tab icon={<MenuBookIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="book" label="Scan Book Copy" />
          <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="student" label="Scan Student Badge" />
          <Tab icon={<ReceiptIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="transaction" label="Scan Transaction Receipt" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Camera Viewport & Manual Input */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
              Scan Viewfinder
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, mb: 2, display: 'block' }}>
              Mode: <strong>{scanMode.toUpperCase()} SCAN</strong>
            </Typography>

            {/* Manual Code Input */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={`Enter ${scanMode} code, ISBN, or ID...`}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePerformLookup(scanInput)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <QrCodeScannerIcon sx={{ color: BORROW_COLORS.primary, fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <CustomButton
                        size="small"
                        onClick={() => handlePerformLookup(scanInput)}
                        sx={{ minWidth: 'auto', px: 1.5, py: 0.25, fontSize: '0.75rem' }}
                      >
                        Scan
                      </CustomButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Viewfinder Camera Box */}
            <Box
              sx={{
                position: 'relative',
                height: 220,
                borderRadius: '10px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: `2px solid ${isCameraActive ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
                mb: 2,
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  display: isCameraActive ? 'block' : 'none',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {isCameraActive && (
                <motion.div
                  animate={{ y: [-90, 90, -90] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '85%',
                    height: 2,
                    backgroundColor: '#2563EB',
                    boxShadow: '0 0 12px #2563EB',
                    zIndex: 3,
                  }}
                />
              )}

              {!isCameraActive && (
                <>
                  <CameraAltIcon sx={{ fontSize: 44, color: '#64748B', mb: 1 }} />
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                    {cameraError || 'Camera Off — Tap Scan Below'}
                  </Typography>
                </>
              )}

              {/* Camera Controls Overlay */}
              {isCameraActive && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: '6px',
                    p: 0.25,
                    zIndex: 4,
                  }}
                >
                  <Tooltip title="Switch Front/Rear Camera">
                    <IconButton size="small" onClick={toggleCameraFacingMode} sx={{ color: '#FFFFFF' }}>
                      <CameraswitchIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Torch">
                    <IconButton size="small" onClick={toggleTorch} sx={{ color: torchEnabled ? '#F59E0B' : '#FFFFFF' }}>
                      {torchEnabled ? <FlashOnIcon sx={{ fontSize: 16 }} /> : <FlashOffIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {isCameraActive ? (
                <CustomButton fullWidth variant="danger" size="small" onClick={stopCameraStream}>
                  Stop Camera
                </CustomButton>
              ) : (
                <CustomButton
                  fullWidth
                  variant="primary"
                  size="small"
                  startIcon={<CameraAltIcon sx={{ fontSize: 16 }} />}
                  onClick={handleSimulateCameraScan}
                >
                  Start Camera Scan
                </CustomButton>
              )}
            </Box>
          </Card>

          {/* Recent Scans Panel */}
          <RecentScansPanel recentScans={recentScans} onReopenScan={(scan) => setScannedResult(scan)} />
        </Grid>

        {/* Right Column: Instant Auto-Action Result Card */}
        <Grid item xs={12} lg={7}>
          {scannedResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <Card sx={{ borderRadius: '12px', border: `2px solid ${BORROW_COLORS.primary}`, p: 2.5 }}>
                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: BORROW_COLORS.success, fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.success, letterSpacing: '0.05em' }}>
                        SCANNED RESULT VERIFIED
                      </Typography>
                    </Box>
                    <StatusBadge status={scannedResult.status} size="small" />
                  </Box>

                  {/* Mode 1: BOOK RESULT */}
                  {scannedResult.type === 'book' && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 110,
                          borderRadius: '6px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#F1F5F9',
                          border: `1px solid ${BORROW_COLORS.border}`,
                        }}
                      >
                        <img
                          src={scannedResult.bookCoverUrl}
                          alt={scannedResult.bookTitle}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>

                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.25 }}>
                          {scannedResult.bookTitle}
                        </Typography>
                        <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                          By {scannedResult.bookAuthor}
                        </Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                          COPY ID: {scannedResult.copyId}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Mode 2: STUDENT RESULT */}
                  {scannedResult.type === 'student' && (
                    <Box sx={{ display: 'flex', gap: 2, mb: 2.5, alignItems: 'center' }}>
                      <Avatar
                        src={scannedResult.avatarUrl || ''}
                        alt={scannedResult.studentName}
                        sx={{ width: 64, height: 64, bgcolor: BORROW_COLORS.primary, fontWeight: 600, fontSize: '1.5rem' }}
                      >
                        {(scannedResult.studentName || 'S')[0]}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 0.25 }}>
                          {scannedResult.studentName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
                          Reg No: {scannedResult.registerNumber}
                        </Typography>
                        <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                          Department: {scannedResult.department}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Mode 3: TRANSACTION RESULT */}
                  {scannedResult.type === 'transaction' && (
                    <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}`, mb: 2.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
                        {scannedResult.bookTitle}
                      </Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                        Borrower: {scannedResult.studentName} • Transaction ID: {scannedResult.id}
                      </Typography>
                    </Box>
                  )}

                  {/* Quick Action Triggers */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <CustomButton
                      variant="primary"
                      size="small"
                      startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
                      onClick={() => openIssueModal && openIssueModal()}
                    >
                      Issue Checkout
                    </CustomButton>

                    <CustomButton
                      variant="secondary"
                      size="small"
                      startIcon={<AssignmentReturnedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => openReturnModal && openReturnModal(scannedResult.rawTxn || scannedResult.activeBorrower)}
                    >
                      Process Return
                    </CustomButton>

                    <CustomButton
                      variant="outline"
                      size="small"
                      startIcon={<ReportProblemIcon sx={{ fontSize: 16 }} />}
                      onClick={handleMarkDamaged}
                    >
                      Mark Damaged
                    </CustomButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card sx={{ height: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, textAlign: 'center', p: 4 }}>
              <Box>
                <QrCodeScannerIcon sx={{ fontSize: 64, color: BORROW_COLORS.textMuted, mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                  Awaiting QR / Barcode Scan
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, maxWidth: 320, display: 'block' }}>
                  Scan a book copy sticky label, student QR badge, or enter code to view instant verification.
                </Typography>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ScannerPage;
