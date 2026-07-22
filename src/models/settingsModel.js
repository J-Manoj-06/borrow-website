/**
 * System Settings Models & Default Configurations
 */

export const DEFAULT_GENERAL_SETTINGS = {
  libraryName: 'Borrow Library Central',
  collegeName: 'University College of Engineering & Technology',
  email: 'library@borrow.edu',
  contactNumber: '+1 (555) 019-2834',
  address: '100 University Boulevard, Tech Campus, Academic Block B',
  website: 'https://borrow.edu/library',
  workingHours: 'Mon - Sat: 8:00 AM - 8:00 PM',
  logoUrl: '',
  bannerUrl: '',
};

export const DEFAULT_BORROW_RULES = {
  defaultBorrowDuration: 14, // days
  maxBooksPerStudent: 3,
  maxActiveRequests: 2,
  renewalLimit: 1,
  reservationDuration: 2, // days
  gracePeriod: 3, // days
  allowRenewals: true,
  allowReservations: true,
  allowMultipleCopies: false,
};

export const DEFAULT_RETURN_RULES = {
  overdueReminderDays: 3,
  returnReminderFrequency: 'Daily',
  lateReturnWarning: true,
  damagedBookWorkflow: 'Assess Fine & Repair',
  lostBookWorkflow: 'Charge Replacement Cost',
  enableFineCalculation: false, // Default OFF for pilot
  finePerDayAmount: 5.0, // $ or ₹ per day
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enablePushNotifications: true,
  emailNotifications: false,
  returnReminders: true,
  overdueAlerts: true,
  announcementNotifications: true,
};

export const DEFAULT_CATEGORIES = [
  { id: 'CAT-01', name: 'Computer Science', active: true },
  { id: 'CAT-02', name: 'Information Technology', active: true },
  { id: 'CAT-03', name: 'Electronics & Communication', active: true },
  { id: 'CAT-04', name: 'Electrical Engineering', active: true },
  { id: 'CAT-05', name: 'Mechanical Engineering', active: true },
  { id: 'CAT-06', name: 'Civil Engineering', active: true },
  { id: 'CAT-07', name: 'Data Science & AI', active: true },
  { id: 'CAT-08', name: 'Agriculture & Bio-Tech', active: true },
  { id: 'CAT-09', name: 'Mathematics & Physics', active: true },
  { id: 'CAT-10', name: 'Literature & Humanities', active: true },
];

export const DEFAULT_DEPARTMENTS = [
  { id: 'DEP-01', name: 'Computer Science & Engineering' },
  { id: 'DEP-02', name: 'Information Technology' },
  { id: 'DEP-03', name: 'Electrical & Electronics' },
  { id: 'DEP-04', name: 'Mechanical Engineering' },
  { id: 'DEP-05', name: 'Civil Engineering' },
  { id: 'DEP-06', name: 'Data Science & AI' },
  { id: 'DEP-07', name: 'Agricultural Engineering' },
];

export const DEFAULT_ACADEMIC_YEARS = [
  { id: 'YR-01', name: '1st Year' },
  { id: 'YR-02', name: '2nd Year' },
  { id: 'YR-03', name: '3rd Year' },
  { id: 'YR-04', name: '4th Year' },
];
