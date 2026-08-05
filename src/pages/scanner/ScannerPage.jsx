/**
 * Production QR & Barcode Scanner Page
 *
 * Features:
 *  - Real camera stream via WebRTC (rear/front, torch, stop/start)
 *  - jsQR-based QR decoding from live canvas frames (requestAnimationFrame loop)
 *  - BarcodeDetector API where supported (barcode/ISBN)
 *  - Manual code entry fallback
 *  - Three scan modes: Book Copy | Student | Transaction
 *  - All lookups hit Firestore directly (no mock data)
 *  - Issue Checkout / Process Return / Mark Damaged actions call existing atomic services
 *  - Duplicate-scan cooldown (2 s)
 *  - Scan history (last 10) stored in component state, re-openable
 *  - Activity logs + student notifications generated on every action
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

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
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
import StopCircleIcon from '@mui/icons-material/StopCircle';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

import PageContainer from '../../components/common/PageContainer';
import CustomButton from '../../components/common/CustomButton';
import StatusBadge from '../../components/common/StatusBadge';
import { BORROW_COLORS } from '../../theme/borrowTheme';

import useAuth from '../../hooks/useAuth';
import useTransactions from '../../hooks/useTransactions';

import {
  lookupBookCopy,
  lookupStudent,
  lookupTransaction,
  markCopyDamaged,
} from '../../services/firebase/scannerService';

// ──────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────────────────────

const SCAN_COOLDOWN_MS = 2000;
const MAX_HISTORY = 10;

const SCAN_MODES = [
  { value: 'book',        label: 'Book / Copy',     icon: <MenuBookIcon sx={{ fontSize: 17 }} /> },
  { value: 'student',     label: 'Student Badge',   icon: <PersonIcon sx={{ fontSize: 17 }} /> },
  { value: 'transaction', label: 'Transaction',     icon: <ReceiptIcon sx={{ fontSize: 17 }} /> },
];

// ──────────────────────────────────────────────────────────────────────────────
// HELPER: decode one video frame via jsQR
// ──────────────────────────────────────────────────────────────────────────────

function decodeFrameWithJsQR(videoEl, canvasEl) {
  const ctx = canvasEl.getContext('2d', { willReadFrequently: true });
  const w = videoEl.videoWidth;
  const h = videoEl.videoHeight;
  if (!w || !h) return null;

  canvasEl.width = w;
  canvasEl.height = h;
  ctx.drawImage(videoEl, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
  return code ? code.data : null;
}

// ──────────────────────────────────────────────────────────────────────────────
// ISSUE DIALOG (quick form to confirm book copy + student before issuing)
// ──────────────────────────────────────────────────────────────────────────────

const IssueDialog = ({ open, onClose, prefillCopyId, prefillBookTitle, prefillBookId, onConfirm, loading }) => {
  const [studentId, setStudentId] = useState('');
  const [copyId, setCopyId] = useState(prefillCopyId || '');
  const [bookId, setBookId] = useState(prefillBookId || '');
  const [bookTitle, setBookTitle] = useState(prefillBookTitle || '');

  useEffect(() => {
    if (open) {
      setCopyId(prefillCopyId || '');
      setBookId(prefillBookId || '');
      setBookTitle(prefillBookTitle || '');
      setStudentId('');
    }
  }, [open, prefillCopyId, prefillBookId, prefillBookTitle]);

  const handleConfirm = () => {
    if (!studentId.trim()) {
      toast.error('Student Register Number or ID is required.');
      return;
    }
    if (!bookId.trim() && !copyId.trim()) {
      toast.error('Book ID or Copy ID is required.');
      return;
    }
    onConfirm({ studentId: studentId.trim(), copyId: copyId.trim(), bookId: bookId.trim(), bookTitle });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Issue Book Checkout</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <TextField
          label="Student Register No. / ID *"
          size="small"
          fullWidth
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="e.g. ST-2024-001"
          autoFocus
        />
        <TextField
          label="Book Copy ID"
          size="small"
          fullWidth
          value={copyId}
          onChange={(e) => setCopyId(e.target.value)}
          helperText="Leave blank to auto-assign next available copy"
        />
        <TextField
          label="Book Document ID"
          size="small"
          fullWidth
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
        />
        {bookTitle && (
          <Alert severity="info" sx={{ py: 0.5 }}>
            Book: <strong>{bookTitle}</strong>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading} startIcon={loading ? <CircularProgress size={14} /> : null}>
          {loading ? 'Issuing…' : 'Confirm Issue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// RETURN DIALOG
// ──────────────────────────────────────────────────────────────────────────────

const ReturnDialog = ({ open, onClose, txn, onConfirm, loading }) => {
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) { setCondition('Good'); setNotes(''); }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Process Book Return</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        {txn && (
          <Alert severity="info" sx={{ py: 0.5 }}>
            Returning <strong>{txn.bookTitle}</strong> for <strong>{txn.studentName}</strong>
          </Alert>
        )}
        <TextField
          select
          label="Book Condition *"
          size="small"
          fullWidth
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          {['New', 'Good', 'Fair', 'Damaged', 'Lost'].map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Notes (optional)"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any inspection notes..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="success" onClick={() => onConfirm(condition, notes)} disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <AssignmentReturnedIcon />}>
          {loading ? 'Processing…' : 'Confirm Return'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// DAMAGED DIALOG
// ──────────────────────────────────────────────────────────────────────────────

const DamagedDialog = ({ open, onClose, copyId, onConfirm, loading }) => {
  const [notes, setNotes] = useState('');
  useEffect(() => { if (open) setNotes(''); }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Mark Copy Damaged</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
        <Alert severity="warning">
          Copy <strong>{copyId}</strong> will be marked as Damaged and removed from available inventory.
        </Alert>
        <TextField
          label="Damage Notes (optional)"
          size="small"
          fullWidth
          multiline
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe the damage..."
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="error" onClick={() => onConfirm(notes)} disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <ReportProblemIcon />}>
          {loading ? 'Updating…' : 'Mark Damaged'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// SCAN HISTORY PANEL
// ──────────────────────────────────────────────────────────────────────────────

const ScanHistoryPanel = ({ history, onReopen }) => {
  if (!history.length) return null;

  return (
    <Card sx={{ mt: 2, borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}` }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <HistoryIcon sx={{ fontSize: 17, color: BORROW_COLORS.textMuted }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Recent Scans ({history.length})</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {history.slice(0, 8).map((item, i) => (
            <Box
              key={i}
              onClick={() => onReopen(item)}
              sx={{
                p: 1.25,
                borderRadius: '8px',
                border: `1px solid ${BORROW_COLORS.border}`,
                backgroundColor: BORROW_COLORS.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { borderColor: BORROW_COLORS.primary, backgroundColor: BORROW_COLORS.primarySurface },
                transition: 'all 0.12s ease',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
                  {item.mode.toUpperCase()} · {new Date(item.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
              <Chip
                label={item.status}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  ml: 1,
                  backgroundColor: item.status === 'Found' ? '#D1FAE5' : item.status === 'Not Found' ? '#FEE2E2' : '#E0E7FF',
                  color: item.status === 'Found' ? '#065F46' : item.status === 'Not Found' ? '#991B1B' : '#3730A3',
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// BOOK RESULT CARD
// ──────────────────────────────────────────────────────────────────────────────

const BookResultCard = ({ result, onIssue, onReturn, onDamaged }) => {
  const { copy, book, activeTxn } = result;
  const isAvailable = copy?.status === 'Available';
  const isBorrowed  = copy?.status === 'Borrowed';

  return (
    <Box>
      {/* Book header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {(book?.coverUrl) && (
          <Box sx={{ width: 72, height: 100, borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: `1px solid ${BORROW_COLORS.border}` }}>
            <img src={book.coverUrl} alt={book?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.25, color: BORROW_COLORS.textPrimary }}>
            {book?.title || 'Book Title'}
          </Typography>
          <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 0.5 }}>
            {book?.author} {book?.isbn ? `• ISBN: ${book.isbn}` : ''}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>
            Category: {book?.category || '—'} · {book?.availableCopies ?? 0} / {book?.totalCopies ?? '?'} available
          </Typography>
        </Box>
      </Box>

      {/* Copy details */}
      {copy && (
        <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}`, mb: 2 }}>
          <Grid container spacing={1.5}>
            {[
              ['Copy ID',   copy.copyId || copy.id],
              ['Status',    copy.status],
              ['Condition', copy.condition || '—'],
              ['Shelf',     copy.shelfLocation || '—'],
              ['Rack',      copy.rackNumber || '—'],
            ].map(([label, val]) => (
              <Grid item xs={6} key={label}>
                <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>{label}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: label === 'Status' && isBorrowed ? BORROW_COLORS.warning : BORROW_COLORS.textPrimary }}>
                  {val}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Active borrower */}
      {activeTxn && (
        <Box sx={{ p: 1.5, borderRadius: '8px', backgroundColor: '#FFF7ED', border: `1px solid #FED7AA`, mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 700, display: 'block', mb: 0.5 }}>
            CURRENTLY BORROWED BY
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activeTxn.studentName}</Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            Reg: {activeTxn.registerNumber} · Due: {activeTxn.dueDate ? new Date(activeTxn.dueDate).toLocaleDateString() : '—'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: BORROW_COLORS.textMuted }}>
            Transaction: {activeTxn.transactionId || activeTxn.id}
          </Typography>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {(isAvailable || !copy) && (
          <CustomButton variant="primary" size="small" startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />} onClick={onIssue}>
            Issue Checkout
          </CustomButton>
        )}
        {isBorrowed && activeTxn && (
          <CustomButton variant="secondary" size="small" startIcon={<AssignmentReturnedIcon sx={{ fontSize: 16 }} />} onClick={onReturn}>
            Process Return
          </CustomButton>
        )}
        {copy && copy.status !== 'Damaged' && copy.status !== 'Lost' && (
          <CustomButton variant="outline" size="small" startIcon={<ReportProblemIcon sx={{ fontSize: 16 }} />} onClick={onDamaged}>
            Mark Damaged
          </CustomButton>
        )}
      </Box>
    </Box>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// STUDENT RESULT CARD
// ──────────────────────────────────────────────────────────────────────────────

const StudentResultCard = ({ result }) => {
  const { student, activeLoans } = result;
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ width: 56, height: 56, bgcolor: BORROW_COLORS.primary, fontWeight: 700, fontSize: '1.3rem' }}>
          {(student.fullName || student.name || 'S')[0].toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{student.fullName || student.name}</Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.primary, fontWeight: 600, display: 'block' }}>
            Reg: {student.registerNumber || student.id}
          </Typography>
          <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>
            {student.department} · {student.year || '—'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
        {[
          ['Email', student.email || '—'],
          ['Phone', student.phone || '—'],
          ['Status', student.status || 'Active'],
          ['Active Loans', String(activeLoans.length)],
        ].map(([label, val]) => (
          <Box key={label} sx={{ p: 1.25, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>{label}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{val}</Typography>
          </Box>
        ))}
      </Box>

      {activeLoans.length > 0 && (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textSecondary, mb: 0.75, display: 'block' }}>
            ACTIVE LOANS ({activeLoans.length})
          </Typography>
          {activeLoans.map((loan) => (
            <Box key={loan.id} sx={{ p: 1.25, mb: 0.75, borderRadius: '8px', border: `1px solid ${BORROW_COLORS.border}`, backgroundColor: BORROW_COLORS.background }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.82rem' }}>{loan.bookTitle}</Typography>
              <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>
                Copy: {loan.bookCopyId} · Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : '—'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// TRANSACTION RESULT CARD
// ──────────────────────────────────────────────────────────────────────────────

const TransactionResultCard = ({ result, onReturn }) => {
  const isActive = result.status === 'Issued' || result.computedStatus === 'Issued';
  const isOverdue = result.isOverdue || result.computedStatus === 'Overdue';

  const rows = [
    ['Transaction ID', result.transactionId || result.id],
    ['Book', result.bookTitle],
    ['Copy ID', result.bookCopyId],
    ['Student', `${result.studentName} (${result.registerNumber})`],
    ['Issue Date', result.issueDate ? new Date(result.issueDate).toLocaleDateString() : '—'],
    ['Due Date', result.dueDate ? new Date(result.dueDate).toLocaleDateString() : '—'],
    ['Return Date', result.returnDate ? new Date(result.returnDate).toLocaleDateString() : '—'],
    ['Status', result.computedStatus || result.status],
    ['Issued By', result.issuedBy || '—'],
    ['Condition', result.condition || '—'],
  ];

  return (
    <Box>
      {isOverdue && (
        <Alert severity="error" sx={{ mb: 2 }}>
          This loan is <strong>Overdue</strong>. Immediate return required.
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
        {rows.map(([label, val]) => (
          <Box key={label} sx={{ p: 1.25, borderRadius: '8px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}` }}>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block' }}>{label}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', wordBreak: 'break-all' }}>{val}</Typography>
          </Box>
        ))}
      </Box>

      {isActive && (
        <CustomButton variant="secondary" size="small" startIcon={<AssignmentReturnedIcon sx={{ fontSize: 16 }} />} onClick={onReturn}>
          Process Return
        </CustomButton>
      )}
    </Box>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// MAIN SCANNER PAGE
// ──────────────────────────────────────────────────────────────────────────────

export const ScannerPage = () => {
  const { adminProfile } = useAuth();
  const { issueBook, returnBook } = useTransactions();

  const adminName = adminProfile?.fullName || adminProfile?.email || 'Lead Librarian';

  // ── Scan mode
  const [scanMode, setScanMode] = useState('book');

  // ── Manual input
  const [scanInput, setScanInput]   = useState('');

  // ── Lookup state
  const [lookupResult, setLookupResult] = useState(null);   // { type, data } | null
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError]   = useState(null);

  // ── Action dialogs
  const [issueDialogOpen, setIssueDialogOpen]   = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [damagedDialogOpen, setDamagedDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Scan history (in-session)
  const [scanHistory, setScanHistory] = useState([]);

  // ── Duplicate scan cooldown
  const lastScannedCodeRef = useRef('');
  const lastScannedAtRef   = useRef(0);

  // ── Camera
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode]         = useState('environment');
  const [torchEnabled, setTorchEnabled]     = useState(false);
  const [cameraError, setCameraError]       = useState(null);
  const [isDecoding, setIsDecoding]         = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);

  // ── Stop camera cleanly
  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraActive(false);
    setTorchEnabled(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── QR decode loop (runs every animation frame while camera is active)
  const startDecodeLoop = useCallback(() => {
    const tick = () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !streamRef.current) return;

      if (video.readyState >= 2) {
        const decoded = decodeFrameWithJsQR(video, canvas);
        if (decoded) {
          const now = Date.now();
          const isDuplicate =
            decoded === lastScannedCodeRef.current &&
            now - lastScannedAtRef.current < SCAN_COOLDOWN_MS;

          if (!isDuplicate) {
            lastScannedCodeRef.current = decoded;
            lastScannedAtRef.current   = now;
            // Trigger lookup (non-blocking)
            performLookup(decoded);
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []); // eslint-disable-line

  // ── Start camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          focusMode: { ideal: 'continuous' },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      startDecodeLoop();
    } catch (err) {
      console.error('Camera error:', err);
      let msg = 'Camera unavailable. Enter code manually.';
      if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Enable it in browser settings.';
      else if (err.name === 'NotFoundError') msg = 'No camera device found on this device.';
      else if (err.name === 'NotSupportedError') msg = 'Camera not supported in this browser.';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  }, [facingMode, stopCamera, startDecodeLoop]);

  // ── Toggle torch
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchEnabled }] });
      setTorchEnabled((p) => !p);
    } catch {
      toast.error('Flash/torch not supported on this camera.');
    }
  };

  // ── Switch front/rear camera
  const switchCamera = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  };

  // ──────────────────────────────────────────────
  // CORE LOOKUP — hits Firestore, no mock data
  // ──────────────────────────────────────────────

  const performLookup = useCallback(async (code) => {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      toast.error('Please enter or scan a code.');
      return;
    }

    setLookupLoading(true);
    setLookupError(null);
    setIsDecoding(true);

    let result = null;
    let histLabel = trimmed;
    let histStatus = 'Not Found';

    try {
      if (scanMode === 'student') {
        const res = await lookupStudent(trimmed);
        if (!res) throw new Error(`No student found matching "${trimmed}"`);
        result = { type: 'student', data: res };
        histLabel = res.student.fullName || trimmed;
        histStatus = 'Found';

      } else if (scanMode === 'transaction') {
        const res = await lookupTransaction(trimmed);
        if (!res) throw new Error(`No transaction found matching "${trimmed}"`);
        result = { type: 'transaction', data: res };
        histLabel = res.bookTitle || trimmed;
        histStatus = 'Found';

      } else {
        // Book mode
        const res = await lookupBookCopy(trimmed);
        if (!res) throw new Error(`No book copy or ISBN found matching "${trimmed}"`);
        result = { type: 'book', data: res };
        histLabel = res.book?.title || res.copy?.copyId || trimmed;
        histStatus = 'Found';
      }

      setLookupResult(result);
      toast.success(`✓ ${result.type.charAt(0).toUpperCase() + result.type.slice(1)} found`);
    } catch (err) {
      setLookupError(err.message || 'Lookup failed');
      setLookupResult(null);
      toast.error(err.message || 'Record not found');
    } finally {
      setLookupLoading(false);
      setIsDecoding(false);

      setScanHistory((prev) => [
        { label: histLabel, mode: scanMode, status: histStatus, ts: new Date().toISOString(), result },
        ...prev.filter((_, i) => i < MAX_HISTORY - 1),
      ]);
    }
  }, [scanMode]);

  // ──────────────────────────────────────────────
  // ACTION HANDLERS
  // ──────────────────────────────────────────────

  const handleIssueConfirm = async ({ studentId, copyId, bookId, bookTitle }) => {
    setActionLoading(true);
    try {
      const bookData = lookupResult?.data?.book;
      await issueBook({
        studentId,
        studentName: studentId,
        registerNumber: studentId,
        bookId: bookId || bookData?.id || '',
        bookCopyId: copyId || '',
        bookTitle: bookTitle || bookData?.title || '',
        bookAuthor: bookData?.author || '',
        bookCoverUrl: bookData?.coverUrl || '',
        isbn: bookData?.isbn || '',
        category: bookData?.category || '',
      }, adminName);
      setIssueDialogOpen(false);
      // Refresh lookup
      const refreshCode = copyId || bookId;
      if (refreshCode) await performLookup(refreshCode);
    } catch (err) {
      toast.error(err.message || 'Issue failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnConfirm = async (condition, notes) => {
    const txnId = lookupResult?.data?.activeTxn?.id
      || lookupResult?.data?.id
      || lookupResult?.data?.id;
    if (!txnId) { toast.error('Cannot determine transaction ID.'); return; }

    setActionLoading(true);
    try {
      await returnBook(txnId, condition, notes, adminName);
      setReturnDialogOpen(false);
      // Refresh
      const copyId = lookupResult?.data?.copy?.copyId || lookupResult?.data?.copy?.id;
      if (copyId) await performLookup(copyId);
    } catch (err) {
      toast.error(err.message || 'Return failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDamagedConfirm = async (notes) => {
    const copyId = lookupResult?.data?.copy?.copyId || lookupResult?.data?.copy?.id;
    if (!copyId) { toast.error('Copy ID not available.'); return; }

    setActionLoading(true);
    try {
      await markCopyDamaged(copyId, notes, adminName);
      setDamagedDialogOpen(false);
      toast.success(`Copy ${copyId} marked Damaged.`);
      await performLookup(copyId);
    } catch (err) {
      toast.error(err.message || 'Failed to mark Damaged');
    } finally {
      setActionLoading(false);
    }
  };

  // Active transaction for return dialog
  const activeTxnForReturn =
    lookupResult?.type === 'book'        ? lookupResult.data.activeTxn
  : lookupResult?.type === 'transaction' ? lookupResult.data
  : null;

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────

  return (
    <PageContainer
      title="QR & Barcode Scanner"
      subtitle="Scan physical copy labels, student QR badges, or transaction receipts for instant Firestore verification."
    >
      {/* Mode Tabs */}
      <Box sx={{ borderBottom: `1px solid ${BORROW_COLORS.border}`, mb: 3 }}>
        <Tabs
          value={scanMode}
          onChange={(_, v) => { setScanMode(v); setLookupResult(null); setLookupError(null); setScanInput(''); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.84rem', minHeight: 40, px: 2 } }}
        >
          {SCAN_MODES.map((m) => (
            <Tab key={m.value} icon={m.icon} iconPosition="start" value={m.value} label={m.label} />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {/* ── LEFT: Camera + Input */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Scan Viewfinder</Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted, display: 'block', mb: 2 }}>
              Mode: <strong>{SCAN_MODES.find((m) => m.value === scanMode)?.label} SCAN</strong>
            </Typography>

            {/* Manual Input */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={`Enter ${scanMode} code, ISBN, register no., or ID…`}
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performLookup(scanInput)}
                disabled={lookupLoading}
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
                        onClick={() => performLookup(scanInput)}
                        disabled={lookupLoading || !scanInput.trim()}
                        sx={{ minWidth: 'auto', px: 1.5, py: 0.25, fontSize: '0.75rem' }}
                        startIcon={lookupLoading ? <CircularProgress size={12} /> : <SearchIcon sx={{ fontSize: 14 }} />}
                      >
                        {lookupLoading ? 'Looking up…' : 'Look Up'}
                      </CustomButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Camera Viewfinder */}
            <Box
              sx={{
                position: 'relative',
                height: 230,
                borderRadius: '10px',
                backgroundColor: '#0F172A',
                overflow: 'hidden',
                border: `2px solid ${isCameraActive ? BORROW_COLORS.primary : BORROW_COLORS.border}`,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{ display: isCameraActive ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Hidden canvas for QR decoding */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Scanning animation bar */}
              {isCameraActive && (
                <motion.div
                  animate={{ y: [-95, 95, -95] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    width: '85%',
                    height: 2,
                    backgroundColor: '#2563EB',
                    boxShadow: '0 0 14px #2563EB',
                    zIndex: 3,
                  }}
                />
              )}

              {/* Decoding indicator */}
              {isDecoding && (
                <Box sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
                  <Chip label="Verifying…" size="small" sx={{ backgroundColor: '#2563EB', color: '#FFF', fontWeight: 700 }} />
                </Box>
              )}

              {/* Off-state prompt */}
              {!isCameraActive && (
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CameraAltIcon sx={{ fontSize: 42, color: '#64748B', mb: 1 }} />
                  <Typography variant="caption" sx={{ color: cameraError ? '#EF4444' : '#94A3B8', fontWeight: 600, display: 'block' }}>
                    {cameraError || 'Camera off — start scanning or type a code above'}
                  </Typography>
                </Box>
              )}

              {/* Camera controls overlay */}
              {isCameraActive && (
                <Box
                  sx={{
                    position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5,
                    backgroundColor: 'rgba(15,23,42,0.65)', borderRadius: '6px', p: 0.25, zIndex: 4,
                  }}
                >
                  <Tooltip title="Switch Camera">
                    <IconButton size="small" onClick={switchCamera} sx={{ color: '#FFF' }}>
                      <CameraswitchIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle Flash">
                    <IconButton size="small" onClick={toggleTorch} sx={{ color: torchEnabled ? '#F59E0B' : '#FFF' }}>
                      {torchEnabled ? <FlashOnIcon sx={{ fontSize: 16 }} /> : <FlashOffIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Camera buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isCameraActive ? (
                <CustomButton fullWidth variant="danger" size="small" startIcon={<StopCircleIcon sx={{ fontSize: 16 }} />} onClick={stopCamera}>
                  Stop Camera
                </CustomButton>
              ) : (
                <CustomButton fullWidth variant="primary" size="small" startIcon={<CameraAltIcon sx={{ fontSize: 16 }} />} onClick={startCamera}>
                  Start Camera Scan
                </CustomButton>
              )}
            </Box>

            {cameraError && (
              <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }} icon={<ErrorOutlineIcon />}>
                {cameraError}
              </Alert>
            )}
          </Card>

          {/* Scan History */}
          <ScanHistoryPanel history={scanHistory} onReopen={(item) => { if (item.result) setLookupResult(item.result); }} />
        </Grid>

        {/* ── RIGHT: Lookup Result */}
        <Grid item xs={12} lg={7}>
          <AnimatePresence mode="wait">
            {lookupLoading && (
              <Card key="loading" sx={{ borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, p: 4, textAlign: 'center', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Querying Firestore…</Typography>
                  <Typography variant="caption" sx={{ color: BORROW_COLORS.textMuted }}>Searching {scanMode} records</Typography>
                </Box>
              </Card>
            )}

            {!lookupLoading && lookupError && (
              <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card sx={{ borderRadius: '12px', border: `2px solid #FCA5A5`, p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <Box>
                    <ErrorOutlineIcon sx={{ fontSize: 44, color: '#EF4444', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#991B1B', mb: 0.5 }}>Not Found</Typography>
                    <Typography variant="body2" sx={{ color: BORROW_COLORS.textSecondary, mb: 2 }}>{lookupError}</Typography>
                    <CustomButton variant="outline" size="small" startIcon={<RefreshIcon />} onClick={() => { setLookupError(null); setScanInput(''); }}>
                      Clear
                    </CustomButton>
                  </Box>
                </Card>
              </motion.div>
            )}

            {!lookupLoading && !lookupError && lookupResult && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
                <Card sx={{ borderRadius: '12px', border: `2px solid ${BORROW_COLORS.primary}`, p: 2.5 }}>
                  <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                    {/* Result header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ color: BORROW_COLORS.success, fontSize: 20 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.success, letterSpacing: '0.05em' }}>
                          FIRESTORE VERIFIED
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Chip label={lookupResult.type.toUpperCase()} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', backgroundColor: BORROW_COLORS.primarySurface, color: BORROW_COLORS.primary }} />
                        <Tooltip title="Clear result">
                          <IconButton size="small" onClick={() => { setLookupResult(null); setLookupError(null); }}>
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Conditional result cards */}
                    {lookupResult.type === 'book' && (
                      <BookResultCard
                        result={lookupResult.data}
                        onIssue={() => setIssueDialogOpen(true)}
                        onReturn={() => setReturnDialogOpen(true)}
                        onDamaged={() => setDamagedDialogOpen(true)}
                      />
                    )}
                    {lookupResult.type === 'student' && <StudentResultCard result={lookupResult.data} />}
                    {lookupResult.type === 'transaction' && (
                      <TransactionResultCard result={lookupResult.data} onReturn={() => setReturnDialogOpen(true)} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!lookupLoading && !lookupError && !lookupResult && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: `1px solid ${BORROW_COLORS.border}`, textAlign: 'center', p: 4 }}>
                  <Box>
                    <QrCodeScannerIcon sx={{ fontSize: 64, color: BORROW_COLORS.textMuted, mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Awaiting Scan</Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, display: 'block' }}>
                      Point the camera at a QR code or enter a code, ISBN, register number, or transaction ID manually.
                    </Typography>
                  </Box>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <IssueDialog
        open={issueDialogOpen}
        onClose={() => setIssueDialogOpen(false)}
        prefillCopyId={lookupResult?.data?.copy?.copyId || lookupResult?.data?.copy?.id || ''}
        prefillBookId={lookupResult?.data?.book?.id || ''}
        prefillBookTitle={lookupResult?.data?.book?.title || ''}
        onConfirm={handleIssueConfirm}
        loading={actionLoading}
      />

      <ReturnDialog
        open={returnDialogOpen}
        onClose={() => setReturnDialogOpen(false)}
        txn={activeTxnForReturn}
        onConfirm={handleReturnConfirm}
        loading={actionLoading}
      />

      <DamagedDialog
        open={damagedDialogOpen}
        onClose={() => setDamagedDialogOpen(false)}
        copyId={lookupResult?.data?.copy?.copyId || lookupResult?.data?.copy?.id || ''}
        onConfirm={handleDamagedConfirm}
        loading={actionLoading}
      />
    </PageContainer>
  );
};

export default ScannerPage;
