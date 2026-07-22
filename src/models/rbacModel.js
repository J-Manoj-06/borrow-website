/**
 * Role-Based Access Control (RBAC) Models & Permission Matrices
 */

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  LIBRARY_ADMIN: 'Library Administrator',
  LIBRARIAN: 'Librarian',
};

export const PERMISSION_MODULES = {
  DASHBOARD: 'Dashboard',
  BOOKS: 'Books',
  REQUESTS: 'Borrow Requests',
  RETURNS: 'Issue & Returns',
  STUDENTS: 'Students',
  SCANNER: 'QR Scanner',
  NOTIFICATIONS: 'Notifications',
  REPORTS: 'Reports',
  ACTIVITY: 'Activity Logs',
  SETTINGS: 'Settings',
  ADMINS: 'Admin Management',
};

export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  APPROVE: 'approve',
  EXPORT: 'export',
};

/**
 * Built-In Permission Matrix mapping Roles to explicit Module Actions
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  [SYSTEM_ROLES.SUPER_ADMIN]: {
    [PERMISSION_MODULES.DASHBOARD]: ['view', 'export'],
    [PERMISSION_MODULES.BOOKS]: ['view', 'create', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.REQUESTS]: ['view', 'approve', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.RETURNS]: ['view', 'create', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.STUDENTS]: ['view', 'create', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.SCANNER]: ['view', 'create', 'edit'],
    [PERMISSION_MODULES.NOTIFICATIONS]: ['view', 'create', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.REPORTS]: ['view', 'export'],
    [PERMISSION_MODULES.ACTIVITY]: ['view', 'export'],
    [PERMISSION_MODULES.SETTINGS]: ['view', 'edit', 'export'],
    [PERMISSION_MODULES.ADMINS]: ['view', 'create', 'edit', 'delete', 'export'],
  },
  [SYSTEM_ROLES.LIBRARY_ADMIN]: {
    [PERMISSION_MODULES.DASHBOARD]: ['view', 'export'],
    [PERMISSION_MODULES.BOOKS]: ['view', 'create', 'edit', 'delete', 'export'],
    [PERMISSION_MODULES.REQUESTS]: ['view', 'approve', 'edit', 'export'],
    [PERMISSION_MODULES.RETURNS]: ['view', 'create', 'edit', 'export'],
    [PERMISSION_MODULES.STUDENTS]: ['view', 'create', 'edit', 'export'],
    [PERMISSION_MODULES.SCANNER]: ['view', 'create', 'edit'],
    [PERMISSION_MODULES.NOTIFICATIONS]: ['view', 'create', 'edit', 'export'],
    [PERMISSION_MODULES.REPORTS]: ['view', 'export'],
    [PERMISSION_MODULES.ACTIVITY]: ['view', 'export'],
    [PERMISSION_MODULES.SETTINGS]: ['view'],
    [PERMISSION_MODULES.ADMINS]: ['view'],
  },
  [SYSTEM_ROLES.LIBRARIAN]: {
    [PERMISSION_MODULES.DASHBOARD]: ['view'],
    [PERMISSION_MODULES.BOOKS]: ['view', 'create', 'edit'],
    [PERMISSION_MODULES.REQUESTS]: ['view', 'approve'],
    [PERMISSION_MODULES.RETURNS]: ['view', 'create', 'edit'],
    [PERMISSION_MODULES.STUDENTS]: ['view'],
    [PERMISSION_MODULES.SCANNER]: ['view', 'create'],
    [PERMISSION_MODULES.NOTIFICATIONS]: ['view'],
    [PERMISSION_MODULES.REPORTS]: ['view'],
    [PERMISSION_MODULES.ACTIVITY]: [],
    [PERMISSION_MODULES.SETTINGS]: [],
    [PERMISSION_MODULES.ADMINS]: [],
  },
};

/**
 * Initial Seed Administrator Accounts Dataset
 */
export const INITIAL_MOCK_ADMINS = [
  {
    id: 'ADM-001',
    adminId: 'ADM-001',
    fullName: 'Lead Librarian Admin',
    employeeId: 'EMP-9901',
    email: 'admin@borrow.com',
    phone: '+1 (555) 019-2834',
    department: 'Central University Library',
    role: SYSTEM_ROLES.SUPER_ADMIN,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastLogin: new Date('2024-07-22T10:30:00').toISOString(),
    createdAt: new Date('2024-01-01T08:00:00').toISOString(),
    notes: 'Super administrator account created during initial system provisioning.',
  },
  {
    id: 'ADM-002',
    adminId: 'ADM-002',
    fullName: 'Sarah Jenkins',
    employeeId: 'EMP-4402',
    email: 'sarah.jenkins@borrow.edu',
    phone: '+1 (555) 432-8765',
    department: 'Computer Science Section',
    role: SYSTEM_ROLES.LIBRARY_ADMIN,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    lastLogin: new Date('2024-07-21T16:20:00').toISOString(),
    createdAt: new Date('2024-02-15T09:30:00').toISOString(),
    notes: 'Manages CS library catalog and student borrow approvals.',
  },
  {
    id: 'ADM-003',
    adminId: 'ADM-003',
    fullName: 'Robert Vance',
    employeeId: 'EMP-1103',
    email: 'robert.vance@borrow.edu',
    phone: '+1 (555) 654-3210',
    department: 'Circulation & Returns Desk',
    role: SYSTEM_ROLES.LIBRARIAN,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    lastLogin: new Date('2024-07-20T11:45:00').toISOString(),
    createdAt: new Date('2024-03-01T10:00:00').toISOString(),
    notes: 'Front-desk librarian handling physical issue checkouts and return condition receipts.',
  },
];
