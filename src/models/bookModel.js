/**
 * Book & BookCopy Data Schema Models & Initial Seed Data
 */

export const BOOK_CATEGORIES = [
  'Computer Science',
  'Software Engineering',
  'Data Science & AI',
  'Mathematics',
  'Physics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Business & Finance',
  'Design & UX',
  'Fiction & Literature',
  'General Science',
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
  ARCHIVED: 'Archived',
};

export const COPY_STATUSES = {
  AVAILABLE: 'Available',
  BORROWED: 'Borrowed',
  RESERVED: 'Reserved',
  LOST: 'Lost',
  DAMAGED: 'Damaged',
  ARCHIVED: 'Archived',
};

export const COPY_CONDITIONS = {
  NEW: 'New',
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
};

/**
 * Initial Mock Books for Development / Fallback
 */
export const INITIAL_MOCK_BOOKS = [
  {
    id: 'bk-clean-code-01',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    subtitle: 'An Agile Guide to Software Development',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    isbn: '9780132350884',
    edition: '1st Edition',
    language: 'English',
    category: 'Software Engineering',
    department: 'Computer Science & Engineering',
    shelfNumber: 'CS-04',
    rackNumber: 'R-02',
    publicationYear: 2008,
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.',
    keywords: ['clean code', 'agile', 'refactoring', 'java', 'architecture'],
    tags: ['Bestseller', 'Recommended', 'Core CS'],
    recommendedReading: true,
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
    totalCopies: 10,
    availableCopies: 7,
    borrowedCopies: 3,
    archivedCopies: 0,
    damagedCopies: 0,
    status: 'Available',
    isArchived: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-07-20').toISOString(),
  },
  {
    id: 'bk-design-patterns-02',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    subtitle: 'Classic Gang of Four Architecture',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    publisher: 'Addison-Wesley',
    isbn: '9780201633610',
    edition: '1st Edition',
    language: 'English',
    category: 'Software Engineering',
    department: 'Computer Science & Engineering',
    shelfNumber: 'CS-04',
    rackNumber: 'R-03',
    publicationYear: 1994,
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
    keywords: ['design patterns', 'gof', 'object oriented', 'uml', 'c++'],
    tags: ['Classic', 'Required Reading'],
    recommendedReading: true,
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    totalCopies: 8,
    availableCopies: 6,
    borrowedCopies: 2,
    archivedCopies: 0,
    damagedCopies: 0,
    status: 'Available',
    isArchived: false,
    createdAt: new Date('2024-02-10').toISOString(),
    updatedAt: new Date('2024-07-18').toISOString(),
  },
  {
    id: 'bk-algo-clrs-03',
    title: 'Introduction to Algorithms',
    subtitle: 'Comprehensive Reference for Data Structures & Algorithms',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    publisher: 'MIT Press',
    isbn: '9780262046305',
    edition: '4th Edition',
    language: 'English',
    category: 'Computer Science',
    department: 'Computer Science & Engineering',
    shelfNumber: 'CS-01',
    rackNumber: 'R-01',
    publicationYear: 2022,
    description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
    keywords: ['algorithms', 'clrs', 'data structures', 'sorting', 'graphs'],
    tags: ['Core Syllabus', 'Advanced CS'],
    recommendedReading: true,
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
    totalCopies: 15,
    availableCopies: 12,
    borrowedCopies: 3,
    archivedCopies: 0,
    damagedCopies: 0,
    status: 'Available',
    isArchived: false,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-07-21').toISOString(),
  },
  {
    id: 'bk-ai-modern-04',
    title: 'Artificial Intelligence: A Modern Approach',
    subtitle: 'The Standard AI Reference Text',
    author: 'Stuart Russell, Peter Norvig',
    publisher: 'Pearson',
    isbn: '9780134610993',
    edition: '4th Edition',
    language: 'English',
    category: 'Data Science & AI',
    department: 'Computer Science & Engineering',
    shelfNumber: 'AI-02',
    rackNumber: 'R-04',
    publicationYear: 2020,
    description: 'The long-anticipated revision of Artificial Intelligence: A Modern Approach explores the full breadth and depth of the field of artificial intelligence (AI).',
    keywords: ['ai', 'machine learning', 'neural networks', 'search', 'robotics'],
    tags: ['AI/ML', 'Graduate Level'],
    recommendedReading: false,
    coverUrl: 'https://images.unsplash.com/photo-1509021436468-d51039746b42?w=500',
    totalCopies: 6,
    availableCopies: 1,
    borrowedCopies: 5,
    archivedCopies: 0,
    damagedCopies: 0,
    status: 'Low Stock',
    isArchived: false,
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date('2024-07-19').toISOString(),
  },
  {
    id: 'bk-system-design-05',
    title: 'System Design Interview – An Insider\'s Guide',
    subtitle: 'Volume 1 & 2 Masterclass',
    author: 'Alex Xu',
    publisher: 'ByteByteGo',
    isbn: '9781736049112',
    edition: '2nd Edition',
    language: 'English',
    category: 'Software Engineering',
    department: 'Information Technology',
    shelfNumber: 'IT-08',
    rackNumber: 'R-01',
    publicationYear: 2020,
    description: 'System design interviews are the hardest to prepare for. This book provides a step-by-step framework to handle system design questions.',
    keywords: ['system design', 'scalability', 'microservices', 'distributed systems'],
    tags: ['Popular', 'Career Preparation'],
    recommendedReading: true,
    coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500',
    totalCopies: 5,
    availableCopies: 0,
    borrowedCopies: 5,
    archivedCopies: 0,
    damagedCopies: 0,
    status: 'Out of Stock',
    isArchived: false,
    createdAt: new Date('2024-04-12').toISOString(),
    updatedAt: new Date('2024-07-22').toISOString(),
  },
];

/**
 * Generate Individual Physical Copies for a given Book
 */
export const generateCopiesForBook = (bookId, isbn, totalCopies, borrowedCopies = 0, damagedCopies = 0) => {
  const copies = [];
  const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');

  for (let i = 1; i <= totalCopies; i++) {
    const copyIndex = String(i).padStart(3, '0');
    const copyId = `CPY-${cleanIsbn.slice(-6)}-${copyIndex}`;

    let status = COPY_STATUSES.AVAILABLE;
    let condition = COPY_CONDITIONS.NEW;

    if (i <= damagedCopies) {
      status = COPY_STATUSES.DAMAGED;
      condition = COPY_CONDITIONS.DAMAGED;
    } else if (i <= damagedCopies + borrowedCopies) {
      status = COPY_STATUSES.BORROWED;
      condition = COPY_CONDITIONS.GOOD;
    }

    copies.push({
      id: copyId,
      copyId,
      bookId,
      status,
      condition,
      shelfLocation: `Shelf-A${(i % 5) + 1}`,
      qrCode: `BORROW-QR-${copyId}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return copies;
};
