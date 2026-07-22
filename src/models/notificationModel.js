/**
 * Notification & Announcement Models & Schemas
 */

export const NOTIFICATION_TYPES = {
  GENERAL: 'General Announcement',
  BOOK_APPROVED: 'Book Approved',
  BOOK_REJECTED: 'Book Rejected',
  BOOK_ISSUED: 'Book Issued',
  BOOK_RETURNED: 'Book Returned',
  RETURN_REMINDER: 'Return Reminder',
  OVERDUE_REMINDER: 'Overdue Reminder',
  LIBRARY_NOTICE: 'Library Notice',
  EMERGENCY_NOTICE: 'Emergency Notice',
};

export const RECIPIENT_TARGETS = {
  ALL_STUDENTS: 'All Students',
  DEPARTMENT: 'Department',
  YEAR: 'Academic Year',
  SPECIFIC_STUDENT: 'Specific Student',
  CURRENTLY_BORROWING: 'Students With Borrowed Books',
  OVERDUE: 'Students With Overdue Books',
  PENDING_REQUESTS: 'Students With Pending Requests',
};

export const NOTIFICATION_PRIORITIES = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

/**
 * Pre-configured Reusable Notification Templates
 */
export const NOTIFICATION_TEMPLATES = [
  {
    id: 'TPL-01',
    title: 'Borrow Request Approved',
    type: NOTIFICATION_TYPES.BOOK_APPROVED,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    recipientTarget: RECIPIENT_TARGETS.SPECIFIC_STUDENT,
    message: 'Your borrow request for "{bookTitle}" has been approved! Please pick up physical copy {copyId} from the library front desk within 48 hours.',
  },
  {
    id: 'TPL-02',
    title: 'Upcoming Book Return Due Reminder',
    type: NOTIFICATION_TYPES.RETURN_REMINDER,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    recipientTarget: RECIPIENT_TARGETS.CURRENTLY_BORROWING,
    message: 'Friendly reminder: Your borrowed book "{bookTitle}" is due for return on {dueDate}. Please return it on time to avoid library fines.',
  },
  {
    id: 'TPL-03',
    title: 'Urgent Overdue Book Warning',
    type: NOTIFICATION_TYPES.OVERDUE_REMINDER,
    priority: NOTIFICATION_PRIORITIES.URGENT,
    recipientTarget: RECIPIENT_TARGETS.OVERDUE,
    message: 'URGENT: Your borrowed book "{bookTitle}" is overdue! Please return physical copy {copyId} immediately to clear your library record.',
  },
  {
    id: 'TPL-04',
    title: 'Library Holiday Notice',
    type: NOTIFICATION_TYPES.LIBRARY_NOTICE,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    recipientTarget: RECIPIENT_TARGETS.ALL_STUDENTS,
    message: 'The main library will remain closed on upcoming official university holidays. Digital catalog browsing and request submissions remain active.',
  },
  {
    id: 'TPL-05',
    title: 'New Book Arrivals Added to Catalog',
    type: NOTIFICATION_TYPES.GENERAL,
    priority: NOTIFICATION_PRIORITIES.LOW,
    recipientTarget: RECIPIENT_TARGETS.ALL_STUDENTS,
    message: 'New textbook editions and recommended reading titles have been added to the Borrow Library catalog. Log in to explore and submit borrow applications!',
  },
];

/**
 * Initial Seed Notifications Dataset
 */
export const INITIAL_MOCK_NOTIFICATIONS = [
  {
    id: 'NOTIF-2024-001',
    title: 'New Computer Science Textbooks Available',
    message: 'We have updated our catalog with the latest 2024 editions of software engineering and AI textbooks.',
    type: NOTIFICATION_TYPES.GENERAL,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    recipients: 'All Students',
    createdBy: 'Lead Librarian Admin',
    sentAt: new Date('2024-07-22T08:30:00').toISOString(),
    status: 'Sent',
    deliveredCount: 420,
    openedCount: 312,
  },
  {
    id: 'NOTIF-2024-002',
    title: 'Return Reminder: Clean Code',
    message: 'Friendly reminder that your loan for Clean Code expires in 2 days.',
    type: NOTIFICATION_TYPES.RETURN_REMINDER,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    recipients: 'Marcus Vance (2023-CS-019)',
    createdBy: 'Automated System',
    sentAt: new Date('2024-07-21T14:00:00').toISOString(),
    status: 'Sent',
    deliveredCount: 1,
    openedCount: 1,
  },
  {
    id: 'NOTIF-2024-003',
    title: 'Overdue Warning Notice',
    message: 'Urgent: Your book loan for Introduction to Algorithms is past its return deadline.',
    type: NOTIFICATION_TYPES.OVERDUE_REMINDER,
    priority: NOTIFICATION_PRIORITIES.URGENT,
    recipients: 'Daniel Kim (2022-EE-033)',
    createdBy: 'Lead Librarian Admin',
    sentAt: new Date('2024-07-20T10:15:00').toISOString(),
    status: 'Sent',
    deliveredCount: 1,
    openedCount: 1,
  },
];

/**
 * Initial Seed Announcements Dataset
 */
export const INITIAL_MOCK_ANNOUNCEMENTS = [
  {
    id: 'ANN-2024-01',
    title: 'Mid-Semester Exam Extended Hours',
    description: 'During mid-semester examinations, the central library study halls will remain open until 11:00 PM daily.',
    category: 'Library Schedule',
    pinned: true,
    createdAt: new Date('2024-07-15T09:00:00').toISOString(),
    expiryDate: new Date('2024-08-15T23:59:59').toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600',
  },
];
