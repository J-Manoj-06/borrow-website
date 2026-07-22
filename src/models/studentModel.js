/**
 * Student Models & Data Schemas
 */

export const STUDENT_STATUSES = {
  ACTIVE: 'Active',
  HAS_BORROWED: 'Has Borrowed Books',
  PENDING_REQUESTS: 'Pending Requests',
  OVERDUE: 'Overdue',
  INACTIVE: 'Inactive',
};

/**
 * Initial Seed Students matching existing transactions & requests
 */
export const INITIAL_MOCK_STUDENTS = [
  {
    id: 'STU-8842',
    studentId: 'STU-8842',
    fullName: 'Alex Rivera',
    registerNumber: '2024-CS-088',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    email: 'alex.rivera@borrow.edu',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    accountCreated: new Date('2024-01-10T09:00:00').toISOString(),
    lastLogin: new Date('2024-07-22T10:45:00').toISOString(),
    status: 'Pending Requests',
    activityTimeline: [
      {
        event: 'Registered on Borrow Mobile App',
        timestamp: new Date('2024-01-10T09:00:00').toISOString(),
        details: 'Firebase Auth verified',
      },
      {
        event: 'Submitted Borrow Request for "Clean Code"',
        timestamp: new Date('2024-07-22T10:45:00').toISOString(),
        details: 'Request ID: REQ-2024-1048',
      },
    ],
  },
  {
    id: 'STU-4210',
    studentId: 'STU-4210',
    fullName: 'Sophia Chen',
    registerNumber: '2024-CS-042',
    department: 'Computer Science & Engineering',
    year: '4th Year',
    email: 'sophia.chen@borrow.edu',
    phone: '+1 (555) 876-5432',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    accountCreated: new Date('2024-01-12T11:30:00').toISOString(),
    lastLogin: new Date('2024-07-22T09:15:00').toISOString(),
    status: 'Pending Requests',
    activityTimeline: [
      {
        event: 'Registered on Borrow Mobile App',
        timestamp: new Date('2024-01-12T11:30:00').toISOString(),
        details: 'Firebase Auth verified',
      },
      {
        event: 'Submitted Borrow Request for "Design Patterns"',
        timestamp: new Date('2024-07-22T09:15:00').toISOString(),
        details: 'Request ID: REQ-2024-1047',
      },
    ],
  },
  {
    id: 'STU-1904',
    studentId: 'STU-1904',
    fullName: 'Marcus Vance',
    registerNumber: '2023-CS-019',
    department: 'Information Technology',
    year: '2nd Year',
    email: 'marcus.vance@borrow.edu',
    phone: '+1 (555) 432-1098',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    accountCreated: new Date('2023-09-01T14:20:00').toISOString(),
    lastLogin: new Date('2024-07-21T17:00:00').toISOString(),
    status: 'Has Borrowed Books',
    activityTimeline: [
      {
        event: 'Registered on Borrow Mobile App',
        timestamp: new Date('2023-09-01T14:20:00').toISOString(),
        details: 'Firebase Auth verified',
      },
      {
        event: 'Checked out "Introduction to Algorithms"',
        timestamp: new Date('2024-07-21T17:00:00').toISOString(),
        details: 'Copy ID: CPY-046305-001',
      },
    ],
  },
  {
    id: 'STU-0512',
    studentId: 'STU-0512',
    fullName: 'Emily Watson',
    registerNumber: '2024-AI-005',
    department: 'Data Science & AI',
    year: '1st Year',
    email: 'emily.watson@borrow.edu',
    phone: '+1 (555) 654-9870',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    accountCreated: new Date('2024-02-15T10:00:00').toISOString(),
    lastLogin: new Date('2024-07-20T11:00:00').toISOString(),
    status: 'Active',
    activityTimeline: [
      {
        event: 'Registered on Borrow Mobile App',
        timestamp: new Date('2024-02-15T10:00:00').toISOString(),
        details: 'Firebase Auth verified',
      },
      {
        event: 'Returned "Artificial Intelligence: A Modern Approach"',
        timestamp: new Date('2024-07-20T11:00:00').toISOString(),
        details: 'Returned in Excellent Condition',
      },
    ],
  },
  {
    id: 'STU-7712',
    studentId: 'STU-7712',
    fullName: 'Daniel Kim',
    registerNumber: '2022-EE-033',
    department: 'Electrical & Electronics',
    year: '4th Year',
    email: 'daniel.kim@borrow.edu',
    phone: '+1 (555) 987-1234',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    accountCreated: new Date('2022-08-20T16:00:00').toISOString(),
    lastLogin: new Date('2024-07-01T10:00:00').toISOString(),
    status: 'Overdue',
    activityTimeline: [
      {
        event: 'Registered on Borrow Mobile App',
        timestamp: new Date('2022-08-20T16:00:00').toISOString(),
        details: 'Firebase Auth verified',
      },
      {
        event: 'Checked out "Clean Code"',
        timestamp: new Date('2024-07-01T10:00:00').toISOString(),
        details: 'Overdue since 15 Jul 2024',
      },
    ],
  },
];
