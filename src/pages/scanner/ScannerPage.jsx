import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SearchIcon from '@mui/icons-material/Search';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnedIcon from '@mui/icons-material/AssignmentReturned';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import { StatusChip } from '../../components/common/CustomTable';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import useBooks from '../../hooks/useBooks';
import useTransactions from '../../hooks/useTransactions';
import useQRCode from '../../hooks/useQRCode';

export const ScannerPage = () => {
  const { books } = useBooks();
  const { transactions, openIssueModal, openReturnModal } = useTransactions();
  const { openCopyHistory } = useQRCode();

  const [scanInput, setScanInput] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);

  const handlePerformLookup = (inputCode) => {
    const code = inputCode.trim();
    if (!code) return;

    // Find matching transaction or book copy
    const matchingTxn = transactions.find(
      (t) => (t.bookCopyId || '').toLowerCase() === code.toLowerCase()
    );

    const matchingBook = books.find(
      (b) =>
        b.isbn?.toLowerCase() === code.toLowerCase() ||
        (b.id || '').toLowerCase() === code.toLowerCase() ||
        code.toLowerCase().includes('clean') ||
        code.toLowerCase().includes('algo')
    ) || books[0];

    const copyObj = {
      id: code,
      copyId: code,
      bookId: matchingBook?.id,
      bookTitle: matchingBook?.title || 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookAuthor: matchingBook?.author || 'Robert C. Martin',
      bookCoverUrl: matchingBook?.coverUrl || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
      category: matchingBook?.category || 'Software Engineering',
      status: matchingTxn ? matchingTxn.computedStatus || matchingTxn.status : 'Available',
      condition: matchingTxn?.condition || 'Good',
      shelfLocation: matchingBook?.shelfNumber || 'CS-04',
      activeBorrower: matchingTxn && matchingTxn.status !== 'Returned' ? matchingTxn : null,
    };

    setScannedResult(copyObj);
    toast.success(`Scanned QR Code for ${code}!`);
  };

  const handleSimulateCameraScan = () => {
    setIsScanningCamera(true);
    setTimeout(() => {
      setIsScanningCamera(false);
      handlePerformLookup('CPY-235088-001');
    }, 1500);
  };

  return (
    <PageContainer
      title="QR & Barcode Scanner"
      subtitle="Scan physical copy QR sticky labels or enter Copy IDs to instantly issue, return, or audit book history."
    >
      <Grid container spacing={3.5}>
        {/* Left Column: Scanner Interface Controls */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ height: '100%', p: 1 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: BORROW_COLORS.textPrimary, mb: 1 }}>
                Scan Physical Copy Label
              </Typography>
              <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 3 }}>
                Use camera, upload barcode image, or type Copy ID manually.
              </Typography>

              {/* 1. Manual Copy ID Input */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.8, color: BORROW_COLORS.textPrimary }}>
                  Manual Copy ID / QR Lookup
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. CPY-235088-001 or 9780132350884"
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

              {/* 2. Viewfinder Camera Box Simulation */}
              <Box
                sx={{
                  position: 'relative',
                  height: 220,
                  borderRadius: '16px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: `2px solid ${isScanningCamera ? BORROW_COLORS.primary : 'transparent'}`,
                  mb: 3,
                }}
              >
                {isScanningCamera ? (
                  <>
                    <motion.div
                      animate={{ y: [-90, 90, -90] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        width: '80%',
                        height: 3,
                        backgroundColor: '#2563EB',
                        boxShadow: '0 0 12px #2563EB',
                      }}
                    />
                    <Typography variant="body2" sx={{ color: '#93C5FD', fontWeight: 700, zIndex: 2 }}>
                      Scanning QR Code matrix...
                    </Typography>
                  </>
                ) : (
                  <>
                    <CameraAltIcon sx={{ fontSize: 48, color: '#64748B', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                      Camera Viewfinder Active
                    </Typography>
                  </>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <CustomButton
                  fullWidth
                  variant="contained"
                  startIcon={<CameraAltIcon />}
                  onClick={handleSimulateCameraScan}
                >
                  Scan with Camera
                </CustomButton>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ borderRadius: '10px', px: 2 }}
                >
                  Upload QR
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={() => handlePerformLookup('CPY-235088-001')}
                  />
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Instant Scanned Copy Result Card */}
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
                        width: 90,
                        height: 125,
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
                        Location: {scannedResult.shelfLocation} • Condition: <strong>{scannedResult.condition}</strong>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Active Borrower Information if Checked Out */}
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
                          {scannedResult.activeBorrower.studentName[0]}
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

                  {/* Instant Action Triggers */}
                  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                    {scannedResult.status === 'Available' ? (
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
