import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import toast from 'react-hot-toast';

// Icons
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { BORROW_COLORS } from '../../theme/borrowTheme';
import CustomButton from '../common/CustomButton';

export const CirculationDeskPanel = ({
  students = [],
  books = [],
  transactions = [],
  onIssueBook,
  onReturnBook,
  onRenewBook,
  onOpenScanner,
  sx = {},
}) => {
  const [activeTab, setActiveTab] = useState('issue'); // 'issue' | 'return' | 'renew' | 'pickup'

  // Selected Entities
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (_, newTab) => {
    setActiveTab(newTab);
    setSelectedStudent(null);
    setSelectedBook(null);
    setSelectedTransaction(null);
  };

  const handleIssueSubmit = async () => {
    if (!selectedStudent || !selectedBook) {
      toast.error('Please select both a student and a book!');
      return;
    }
    setLoading(true);
    try {
      await onIssueBook({
        studentId: selectedStudent.id,
        studentName: selectedStudent.fullName,
        registerNumber: selectedStudent.registerNumber,
        department: selectedStudent.department || 'Computer Science',
        bookId: selectedBook.id,
        bookTitle: selectedBook.title,
        isbn: selectedBook.isbn,
        notes,
      });
      setSelectedBook(null);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnSubmit = async () => {
    if (!selectedTransaction) {
      toast.error('Please select a transaction to return!');
      return;
    }
    setLoading(true);
    try {
      await onReturnBook(selectedTransaction.id, returnCondition, notes);
      setSelectedTransaction(null);
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeTransactions = transactions.filter((t) => t.status === 'Issued' || t.status === 'Borrowed' || t.status === 'Approved');

  return (
    <Card
      sx={{
        borderRadius: '12px',
        border: `1px solid ${BORROW_COLORS.border}`,
        backgroundColor: BORROW_COLORS.surface,
        boxShadow: BORROW_COLORS.cardShadow,
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* Circulation Mode Tabs */}
        <Box sx={{ borderBottom: `1px solid ${BORROW_COLORS.border}`, mb: 2.5 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
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
            <Tab icon={<MenuBookIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="issue" label="Issue Book" />
            <Tab icon={<AssignmentReturnIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="return" label="Return Book" />
            <Tab icon={<AutorenewIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="renew" label="Renew Book" />
            <Tab icon={<BookmarkAddedIcon sx={{ fontSize: 18 }} />} iconPosition="start" value="pickup" label="Reservation Pickup" />
          </Tabs>
        </Box>

        {/* Mode 1: ISSUE WORKFLOW */}
        {activeTab === 'issue' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                STEP 1: SELECT STUDENT
              </Typography>
              <Autocomplete
                options={students}
                getOptionLabel={(opt) => `${opt.fullName || 'Student'} (${opt.registerNumber || opt.id})`}
                value={selectedStudent}
                onChange={(_, val) => setSelectedStudent(val)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search student by name or reg no..." size="small" fullWidth />
                )}
              />
              {selectedStudent && (
                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '6px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 28, height: 28, bgcolor: BORROW_COLORS.primary, fontSize: '0.75rem', fontWeight: 600 }}>
                    {(selectedStudent.fullName || 'S')[0]}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{selectedStudent.fullName}</Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>{selectedStudent.department || 'Computer Science'}</Typography>
                  </Box>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                STEP 2: SELECT BOOK
              </Typography>
              <Autocomplete
                options={books.filter((b) => (b.availableCopies ?? 0) > 0)}
                getOptionLabel={(opt) => `${opt.title || 'Book'} (ISBN: ${opt.isbn || 'N/A'})`}
                value={selectedBook}
                onChange={(_, val) => setSelectedBook(val)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search book by title or ISBN..." size="small" fullWidth />
                )}
              />
              {selectedBook && (
                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: '6px', backgroundColor: BORROW_COLORS.background, border: `1px solid ${BORROW_COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{selectedBook.title}</Typography>
                    <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary }}>{selectedBook.author}</Typography>
                  </Box>
                  <Chip label={`${selectedBook.availableCopies || 0} avail`} size="small" sx={{ backgroundColor: BORROW_COLORS.successLight, color: BORROW_COLORS.success, fontWeight: 600 }} />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <CustomButton variant="outline" size="small" startIcon={<QrCodeScannerIcon />} onClick={onOpenScanner}>
                  Scan QR / Barcode
                </CustomButton>

                <CustomButton variant="primary" loading={loading} onClick={handleIssueSubmit} startIcon={<CheckCircleIcon />}>
                  Complete Checkout Issue
                </CustomButton>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Mode 2: RETURN WORKFLOW */}
        {activeTab === 'return' && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                SELECT ISSUED LOAN RECORD
              </Typography>
              <Autocomplete
                options={activeTransactions}
                getOptionLabel={(opt) => `${opt.bookTitle || 'Book'} — Borrowed by ${opt.studentName || 'Student'}`}
                value={selectedTransaction}
                onChange={(_, val) => setSelectedTransaction(val)}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search active loan by student or book..." size="small" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: BORROW_COLORS.textMuted, mb: 1, display: 'block' }}>
                BOOK RETURN CONDITION
              </Typography>
              <TextField
                select
                size="small"
                fullWidth
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
              >
                <MenuItem value="Good">Good Condition (Default)</MenuItem>
                <MenuItem value="Minor Wear">Minor Wear & Tear</MenuItem>
                <MenuItem value="Damaged">Damaged (Requires Repair)</MenuItem>
                <MenuItem value="Lost">Lost Copy</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <CustomButton variant="outline" size="small" startIcon={<QrCodeScannerIcon />} onClick={onOpenScanner}>
                  Scan Returned Copy QR
                </CustomButton>

                <CustomButton variant="primary" loading={loading} onClick={handleReturnSubmit} startIcon={<CheckCircleIcon />}>
                  Process Check-in Return
                </CustomButton>
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Mode 3 & 4 Placeholders */}
        {(activeTab === 'renew' || activeTab === 'pickup') && (
          <Box sx={{ py: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: BORROW_COLORS.textPrimary }}>
              Quick {activeTab === 'renew' ? 'Loan Renewal' : 'Reservation Pickup'} Desk
            </Typography>
            <Typography variant="caption" sx={{ color: BORROW_COLORS.textSecondary, mb: 2, display: 'block' }}>
              Select loan transaction to extend deadline or fulfill student reservation.
            </Typography>
            <CustomButton variant="outline" size="small" startIcon={<QrCodeScannerIcon />} onClick={onOpenScanner}>
              Scan Student / Book QR Code
            </CustomButton>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CirculationDeskPanel;
