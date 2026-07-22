import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import { BORROW_COLORS } from '../../theme/borrowTheme';
import { useBooks } from '../../hooks/useBooks';
import CustomDialog from '../common/CustomDialog';
import CustomButton from '../common/CustomButton';

const MOCK_STUDENTS = [
  { studentId: 'STU-8842', name: 'Alex Rivera', regNo: '2024-CS-088', dept: 'Computer Science & Engineering', year: '3rd Year' },
  { studentId: 'STU-4210', name: 'Sophia Chen', regNo: '2024-CS-042', dept: 'Computer Science & Engineering', year: '4th Year' },
  { studentId: 'STU-1904', name: 'Marcus Vance', regNo: '2023-CS-019', dept: 'Information Technology', year: '2nd Year' },
  { studentId: 'STU-0512', name: 'Emily Watson', regNo: '2024-AI-005', dept: 'Data Science & AI', year: '1st Year' },
  { studentId: 'STU-7712', name: 'Daniel Kim', regNo: '2022-EE-033', dept: 'Electrical & Electronics', year: '4th Year' },
];

export const IssueDialog = ({ open, onClose, onConfirm }) => {
  const { books } = useBooks();

  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);
  const [selectedBook, setSelectedBook] = useState(books[0] || null);
  const [selectedCopyId, setSelectedCopyId] = useState('');
  const [dueDateStr, setDueDateStr] = useState(format(addDays(new Date(), 14), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableBooks = books.filter((b) => !b.isArchived && b.availableCopies > 0);

  const handleBookChange = (bookId) => {
    const book = books.find((b) => b.id === bookId);
    setSelectedBook(book);
    if (book) {
      const cleanIsbn = book.isbn ? book.isbn.replace(/[^0-9X]/gi, '') : '000000';
      setSelectedCopyId(`CPY-${cleanIsbn.slice(-6)}-001`);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedBook) return;

    setSubmitting(true);
    try {
      const cleanIsbn = selectedBook.isbn ? selectedBook.isbn.replace(/[^0-9X]/gi, '') : '000000';
      const copyId = selectedCopyId || `CPY-${cleanIsbn.slice(-6)}-001`;

      const issuePayload = {
        studentId: selectedStudent.studentId,
        studentName: selectedStudent.name,
        registerNumber: selectedStudent.regNo,
        department: selectedStudent.dept,
        year: selectedStudent.year,
        bookId: selectedBook.id,
        bookCopyId: copyId,
        bookTitle: selectedBook.title,
        bookAuthor: selectedBook.author,
        bookCoverUrl: selectedBook.coverUrl,
        isbn: selectedBook.isbn,
        category: selectedBook.category,
        dueDate: new Date(dueDateStr).toISOString(),
        notes,
      };

      await onConfirm(issuePayload);
    } catch {
      // Toast handled by context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title="Issue Book to Student"
      subtitle="Select student, catalog title, and physical Copy ID to record checkout."
      actions={
        <>
          <CustomButton variant="outlined" onClick={onClose} disabled={submitting}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="contained"
            color="primary"
            loading={submitting}
            onClick={handleSubmit}
            startIcon={<MenuBookIcon />}
          >
            Confirm Issue Checkout
          </CustomButton>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        {/* Student Selector */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Select Registered Student *
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedStudent.studentId}
            onChange={(e) => {
              const stu = MOCK_STUDENTS.find((s) => s.studentId === e.target.value);
              if (stu) setSelectedStudent(stu);
            }}
          >
            {MOCK_STUDENTS.map((stu) => (
              <MenuItem key={stu.studentId} value={stu.studentId}>
                {stu.name} ({stu.regNo}) • {stu.dept}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Book Selector */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: BORROW_COLORS.textPrimary }}>
            Select Book Title from Catalog *
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedBook?.id || ''}
            onChange={(e) => handleBookChange(e.target.value)}
          >
            {availableBooks.map((book) => (
              <MenuItem key={book.id} value={book.id}>
                {book.title} ({book.availableCopies} available)
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Physical Copy ID & Due Date */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Physical Book Copy ID *"
              value={
                selectedCopyId ||
                (selectedBook
                  ? `CPY-${(selectedBook.isbn || '').replace(/[^0-9X]/gi, '').slice(-6)}-001`
                  : 'CPY-001')
              }
              onChange={(e) => setSelectedCopyId(e.target.value)}
              helperText="Individual barcode sticker ID"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              fullWidth
              label="Return Due Date *"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        {/* Librarian Notes */}
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Issue Checkout Notes (Optional)"
          placeholder="e.g. Standard 14-day checkout granted for semester project..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Box>
    </CustomDialog>
  );
};

export default IssueDialog;
