/**
 * Book & BookCopy Data Schema Models
 */

export const BOOK_CATEGORIES = [
  'Computer Science',
  'Mathematics',
  'Engineering',
  'Electronics',
  'Mechanical',
  'Civil',
  'Physics',
  'Chemistry',
  'Biology',
  'Commerce',
  'Business',
  'Economics',
  'History',
  'Geography',
  'Political Science',
  'Psychology',
  'Law',
  'Medicine',
  'Nursing',
  'Pharmacy',
  'Agriculture',
  'Literature',
  'Tamil',
  'English',
  'Hindi',
  'General Knowledge',
  'Competitive Exams',
  'Novels',
  'Fiction',
  'Non Fiction',
  'Biography',
  'Children',
  'Reference',
  'Magazine',
  'Journal',
  'Research',
  'Other',
];

export const BOOK_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electrical & Electronics',
  'Mechanical Engineering',
  'Business Administration',
  'Humanities & Sciences',
];

export const BOOK_STATUSES = {
  AVAILABLE: 'Available',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
  UNAVAILABLE: 'Unavailable',
  ARCHIVED: 'Archived',
};

export const COPY_STATUSES = {
  AVAILABLE: 'Available',
  BORROWED: 'Borrowed',
  RESERVED: 'Reserved',
  DAMAGED: 'Damaged',
  LOST: 'Lost',
  ARCHIVED: 'Archived',
  MAINTENANCE: 'Under Maintenance',
};

export const COPY_CONDITIONS = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
};

/**
 * Generate Individual Physical Copies for a given Book Title
 */
export const generateCopiesForBook = (
  bookId,
  isbn,
  totalCopies,
  startCopyNum = 1,
  shelfLocation = 'CS-01',
  rackNumber = 'R-01'
) => {
  const copies = [];
  const cleanIsbn = isbn ? isbn.replace(/[^0-9X]/gi, '') : '000000';

  for (let i = 0; i < totalCopies; i++) {
    const copyNum = startCopyNum + i;
    const copyIndexStr = String(copyNum).padStart(3, '0');
    const copyId = `CPY-${cleanIsbn.slice(-6)}-${copyIndexStr}`;

    copies.push({
      id: copyId,
      copyId,
      bookId,
      copyNumber: copyNum,
      status: COPY_STATUSES.AVAILABLE,
      condition: COPY_CONDITIONS.NEW,
      shelfLocation,
      rackNumber,
      qrCode: `BORROW-QR-${copyId}`,
      barcode: cleanIsbn,
      currentTransactionId: null,
      currentBorrowerId: null,
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return copies;
};
