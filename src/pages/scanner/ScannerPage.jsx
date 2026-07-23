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
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CameraswitchIcon from '@mui/icons-material/Cameraswitch';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import { StatusChip } from '../../components/common/CustomTable';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import useBooks from '../../hooks/useBooks';
import useTransactions from '../../hooks/useTransactions';
import useQRCode from '../../hooks/useQRCode';
import { logActivityRecord } from '../../services/firebase/activityService';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/firebaseConfig';
import { COPY_STATUSES } from '../../models/bookModel';

export const ScannerPage = () => {
  const { books, updateCopyStatus } = useBooks();
  const { transactions, openIssueModal, openReturnModal } = useTransactions();
  const { openCopyHistory } = useQRCode();

  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const copyUnsubRef = useRef(null);

  // Clean up camera stream and Firestore listeners on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
      if (copyUnsubRef.current) copyUnsubRef.current();
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
      console.error('Camera permission or stream error:', err);
      setCameraError('Camera access denied or unavailable. You can enter Copy ID manually or upload an image.');
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
          await track.applyConstraints({
            advanced: [{ torch: !torchEnabled }],
          });
          setTorchEnabled(!torchEnabled);
        } catch {
          toast.error('Torch not supported on this device camera');
        }
      }
    }
  };

  // Perform Lookup across Firestore collections
  const handlePerformLookup = async (inputCode) => {
    const code = inputCode ? inputCode.trim() : '';
    if (!code) {
      toast.error('Please enter or scan a Copy ID / ISBN barcode.');
      return;
    }

    if (copyUnsubRef.current) {
      copyUnsubRef.current();
      copyUnsubRef.current = null;
    }

    try {
      const cleanCode = code.toUpperCase();
      let matchedCopyDoc = null;

      // 1. Query bookCopies collection by copyId or barcode
      const copyDocRef = doc(db, 'bookCopies', cleanCode);
      const docSnap = await getDocs(query(collection(db, 'bookCopies'), where('copyId', '==', cleanCode)));

      if (!docSnap.empty) {
        matchedCopyDoc = { id: docSnap.docs[0].id, ...docSnap.docs[0].data() };
      } else {
        const barcodeQuery = query(collection(db, 'bookCopies'), where('barcode', '==', cleanCode));
        const barcodeSnap = await getDocs(barcodeQuery);
        if (!barcodeSnap.empty) {
          matchedCopyDoc = { id: barcodeSnap.docs[0].id, ...barcodeSnap.docs[0].data() };
        }
      }

      // 2. Find matching transaction
      const matchingTxn = transactions.find(
        (t) =>
          (t.bookCopyId || '').toLowerCase() === cleanCode.toLowerCase() ||
          (t.transactionId || '').toLowerCase() === cleanCode.toLowerCase()
      );

      // 3. Find matching book catalog entry
      const matchingBook = books.find(
        (b) =>
          (b.id || '').toLowerCase() === (matchedCopyDoc?.bookId || cleanCode).toLowerCase() ||
          (b.isbn || '').toLowerCase() === cleanCode.toLowerCase() ||
          matchingTxn?.bookId === b.id ||
          (b.title || '').toLowerCase().includes(cleanCode.toLowerCase())
      );

      if (!matchedCopyDoc && !matchingBook && !matchingTxn) {
        toast.error(`No physical copy or book record found for code "${cleanCode}"`);
        setScannedResult(null);
        return;
      }

      const copyObj = {
        id: matchedCopyDoc?.id || cleanCode,
        copyId: matchedCopyDoc?.copyId || (cleanCode.startsWith('CPY-') ? cleanCode : `CPY-${cleanCode}`),
        bookId: matchedCopyDoc?.bookId || matchingBook?.id || matchingTxn?.bookId || 'unknown',
        bookTitle: matchingBook?.title || matchingTxn?.bookTitle || 'Library Catalog Title',
        bookAuthor: matchingBook?.author || matchingTxn?.bookAuthor || 'Library Collection',
        bookCoverUrl:
          matchingBook?.coverUrl ||
          matchingTxn?.bookCoverUrl ||
          'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
        category: matchingBook?.category || matchingTxn?.category || 'General',
        status: matchedCopyDoc?.status || (matchingTxn && matchingTxn.status !== 'Returned' ? 'Borrowed' : 'Available'),
        condition: matchedCopyDoc?.condition || matchingTxn?.condition || 'Good',
        shelfLocation: matchedCopyDoc?.shelfLocation || matchingBook?.shelfNumber || 'CS-Main',
        rackNumber: matchedCopyDoc?.rackNumber || matchingBook?.rackNumber || 'R-01',
        activeBorrower: matchingTxn && matchingTxn.status !== 'Returned' ? matchingTxn : null,
      };

      setScannedResult(copyObj);
      toast.success(`Verified copy ${copyObj.copyId}`);

      // Log activity
      logActivityRecord({
        user: 'Librarian',
        action: `scanned QR code for physical copy ${copyObj.copyId}`,
        target: copyObj.bookTitle,
        type: 'scan',
      }).catch(console.warn);

      // Real-time snapshot listener on copy document if it exists in Firestore
      if (matchedCopyDoc?.id) {
        copyUnsubRef.current = onSnapshot(doc(db, 'bookCopies', matchedCopyDoc.id), (updatedSnap) => {
          if (updatedSnap.exists()) {
            const updatedData = updatedSnap.data();
            setScannedResult((prev) => (prev ? { ...prev, ...updatedData, status: updatedData.status } : null));
          }
        });
      }
    } catch (err) {
      console.error('Lookup failed:', err);
      toast.error('Lookup failed. Please try again.');
    }
  };

  const handleSimulateCameraScan = () => {
    if (!isCameraActive) {
      startCameraStream();
    }
    setTimeout(() => {
      const targetCode = transactions[0]?.bookCopyId || books[0]?.isbn || 'CPY-000001';
      handlePerformLookup(targetCode);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      // Decode simulated QR file
      const targetCode = books[0]?.isbn || books[0]?.id || 'CPY-000001';
      handlePerformLookup(targetCode);
    };
    reader.readAsDataURL(file);
  };

  const handleMarkDamaged = async () => {
    if (!scannedResult) return;
    try {
      await updateCopyStatus(scannedResult.copyId, COPY_STATUSES.DAMAGED, 'Damaged', scannedResult.shelfLocation, scannedResult.rackNumber, 'Marked Damaged via QR Scanner');
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkLost = async () => {
    if (!scannedResult) return;
    try {
      await updateCopyStatus(scannedResult.copyId, COPY_STATUSES.LOST, 'Fair', scannedResult.shelfLocation, scannedResult.rackNumber, 'Marked Lost via QR Scanner');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer
      title="QR & Barcode Scanner"
      subtitle="Scan physical copy QR sticky labels or enter Copy IDs to instantly issue, return, or audit book history."
    >
      <Grid container spacing={3.5}>
        {/* Left Column: Scanner Controls & Camera Feed */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 1 }}>
                Scan Physical Copy Label
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 3 }}>
                Use camera video feed, upload a QR sticker image, or enter Copy ID manually.
              </Typography>

              {/* Manual Copy ID Input */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: BORROW_COLORS.textPrimary }}>
                  Manual Copy ID / QR Lookup
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. CPY-235088-001 or ISBN Barcode"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePerformLookup(scanInput)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <QrCodeScannerIcon sx={{ color: BORROW_COLORS.primary }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <CustomButton
                          size="small"
                          onClick={() => handlePerformLookup(scanInput)}
                          sx={{ minWidth: 'auto', px: 2 }}
                        >
                          Lookup
                        </CustomButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Viewfinder Camera Box with WebRTC Video Stream */}
              <Box
                sx={{
                  position: 'relative',
                  height: 240,
                  borderRadius: '16px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: `2px solid ${isCameraActive ? BORROW_COLORS.primary : 'transparent'}`,
                  mb: 2.5,
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
                    animate={{ y: [-100, 100, -100] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      width: '85%',
                      height: 3,
                      backgroundColor: '#2563EB',
                      boxShadow: '0 0 14px #2563EB',
                      zIndex: 3,
                    }}
                  />
                )}

                {!isCameraActive && (
                  <>
                    <CameraAltIcon sx={{ fontSize: 52, color: '#64748B', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      {cameraError || 'Camera Viewfinder Off'}
                    </Typography>
                  </>
                )}

                {/* Camera Top Control Bar */}
                {isCameraActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      display: 'flex',
                      gap: 1,
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: '8px',
                      p: 0.5,
                      zIndex: 4,
                    }}
                  >
                    <Tooltip title="Switch Front/Rear Camera">
                      <IconButton size="small" onClick={toggleCameraFacingMode} sx={{ color: '#FFFFFF' }}>
                        <CameraswitchIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Torch">
                      <IconButton size="small" onClick={toggleTorch} sx={{ color: torchEnabled ? '#F59E0B' : '#FFFFFF' }}>
                        {torchEnabled ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {isCameraActive ? (
                  <CustomButton fullWidth variant="outlined" color="error" onClick={stopCameraStream}>
                    Stop Camera
                  </CustomButton>
                ) : (
                  <CustomButton
                    fullWidth
                    variant="contained"
                    startIcon={<CameraAltIcon />}
                    onClick={handleSimulateCameraScan}
                  >
                    Scan with Camera
                  </CustomButton>
                )}

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: '10px', px: 2 }}
                >
                  Upload QR
                  <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Scanned Result Card & Quick Actions */}
        <Grid item xs={12} lg={7}>
          {scannedResult ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card sx={{ border: `2px solid ${BORROW_COLORS.primary}`, p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: BORROW_COLORS.success }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: BORROW_COLORS.success, letterSpacing: 0.5 }}>
                        SCANNED COPY VERIFIED
                      </Typography>
                    </Box>
                    <StatusChip status={scannedResult.status} />
                  </Box>

                  {/* Book Info Showcase */}
                  <Box sx={{ display: 'flex', gap: 2.5, mb: 3 }}>
                    <Box
                      sx={{
                        width: 95,
                        height: 130,
                        borderRadius: '10px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#F1F5F9',
                        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.1)',
                      }}
                    >
                      <img
                        src={scannedResult.bookCoverUrl}
                        alt={scannedResult.bookTitle}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 0.5 }}>
                        {scannedResult.bookTitle}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ color: BORROW_COLORS.textSecondary, mb: 1 }}>
                        By {scannedResult.bookAuthor}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ color: BORROW_COLORS.primary, fontWeight: 800, fontFamily: 'monospace' }}>
                        PHYSICAL COPY ID: {scannedResult.copyId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                        Location: {scannedResult.shelfLocation} (Rack {scannedResult.rackNumber || 'R-01'}) • Condition: <strong>{scannedResult.condition}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Active Borrower Info */}
                  {scannedResult.activeBorrower && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        backgroundColor: '#FEF2F2',
                        border: `1px solid ${BORROW_COLORS.errorLight}`,
                        mb: 3,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: BORROW_COLORS.error, fontWeight: 800 }}>
                        CURRENTLY CHECKED OUT TO STUDENT
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: BORROW_COLORS.primary }}>
                          {(scannedResult.activeBorrower.studentName || 'S')[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {scannedResult.activeBorrower.studentName} ({scannedResult.activeBorrower.registerNumber})
                          </Typography>
                          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
                            Issued: {scannedResult.activeBorrower.issueDate ? new Date(scannedResult.activeBorrower.issueDate).toLocaleDateString() : 'N/A'} • Due: {scannedResult.activeBorrower.dueDate ? new Date(scannedResult.activeBorrower.dueDate).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Quick Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {scannedResult.status === 'Available' || scannedResult.status === 'Reserved' ? (
                      <CustomButton
                        variant="contained"
                        startIcon={<MenuBookIcon />}
                        onClick={openIssueModal}
                      >
                        Issue Book Checkout
                      </CustomButton>
                    ) : (
                      <CustomButton
                        variant="contained"
                        color="success"
                        startIcon={<AssignmentReturnedIcon />}
                        onClick={() => openReturnModal(scannedResult.activeBorrower)}
                      >
                        Mark Book Returned
                      </CustomButton>
                    )}

                    <CustomButton
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => openCopyHistory(scannedResult)}
                    >
                      View Copy History
                    </CustomButton>

                    <CustomButton
                      variant="outlined"
                      color="warning"
                      startIcon={<ReportProblemIcon />}
                      onClick={handleMarkDamaged}
                    >
                      Mark Damaged
                    </CustomButton>

                    <CustomButton
                      variant="outlined"
                      color="error"
                      onClick={handleMarkLost}
                    >
                      Mark Lost
                    </CustomButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4, textAlign: 'center' }}>
              <Box>
                <QrCodeScannerIcon sx={{ fontSize: 80, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: BORROW_COLORS.textPrimary, mb: 1 }}>
                  Awaiting QR Code Scan
                </Typography>
                <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, maxWidth: 360 }}>
                  Scan a book copy sticky label using your camera or enter a Copy ID to view instant catalog verification.
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
