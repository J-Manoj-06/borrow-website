/**
 * Firestore Database Seeding Utility for Local Emulator & Staging Environment
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'borrow-mobile-app',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedSampleData = async () => {
  console.log('🌱 Starting Firestore Seeding for Borrow Library Admin Portal...');

  try {
    // 1. Seed Sample Books
    const books = [
      {
        id: 'book_cs_101',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: 'Computer Science',
        totalCopies: 5,
        availableCopies: 3,
        borrowedCopies: 2,
        reservedCopies: 0,
        damagedCopies: 0,
        lostCopies: 0,
        shelfNumber: 'CS-01',
        rackNumber: 'R-01',
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'book_math_202',
        title: 'Introduction to Algorithms (CLRS)',
        author: 'Thomas H. Cormen',
        isbn: '9780262033848',
        category: 'Computer Science',
        totalCopies: 4,
        availableCopies: 4,
        borrowedCopies: 0,
        reservedCopies: 0,
        damagedCopies: 0,
        lostCopies: 0,
        shelfNumber: 'CS-02',
        rackNumber: 'R-01',
        isArchived: false,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const b of books) {
      await setDoc(doc(db, 'books', b.id), b);
      console.log(`✓ Seeded book "${b.title}"`);
    }

    // 2. Seed Sample Physical Copies
    const copies = [
      {
        id: 'CPY-235088-001',
        copyId: 'CPY-235088-001',
        bookId: 'book_cs_101',
        copyNumber: 1,
        status: 'Available',
        condition: 'Excellent',
        shelfLocation: 'CS-01',
        rackNumber: 'R-01',
        currentBorrowerId: null,
      },
      {
        id: 'CPY-235088-002',
        copyId: 'CPY-235088-002',
        bookId: 'book_cs_101',
        copyNumber: 2,
        status: 'Borrowed',
        condition: 'Good',
        shelfLocation: 'CS-01',
        rackNumber: 'R-01',
        currentBorrowerId: 'ST-2024-001',
      },
    ];

    for (const c of copies) {
      await setDoc(doc(db, 'bookCopies', c.id), c);
      console.log(`✓ Seeded physical copy ${c.copyId}`);
    }

    console.log('🎉 Firestore Database Seeding Completed Successfully!');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
};

seedSampleData();
