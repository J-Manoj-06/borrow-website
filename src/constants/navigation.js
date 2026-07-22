import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SwapHorizontalCircleOutlinedIcon from '@mui/icons-material/SwapHorizontalCircleOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { ROUTES } from './routes';

export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: DashboardOutlinedIcon,
  },
  {
    id: 'books',
    title: 'Books',
    path: ROUTES.BOOKS,
    icon: MenuBookOutlinedIcon,
  },
  {
    id: 'requests',
    title: 'Borrow Requests',
    path: ROUTES.REQUESTS,
    icon: SwapHorizontalCircleOutlinedIcon,
    badgeKey: 'pendingRequests',
  },
  {
    id: 'returns',
    title: 'Issue & Returns',
    path: ROUTES.RETURNS,
    icon: AssignmentReturnOutlinedIcon,
  },
  {
    id: 'students',
    title: 'Students',
    path: ROUTES.STUDENTS,
    icon: PeopleAltOutlinedIcon,
  },
  {
    id: 'scanner',
    title: 'QR Scanner',
    path: ROUTES.SCANNER,
    icon: QrCodeScannerOutlinedIcon,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
    icon: NotificationsOutlinedIcon,
  },
  {
    id: 'reports',
    title: 'Reports',
    path: ROUTES.REPORTS,
    icon: AssessmentOutlinedIcon,
  },
  {
    id: 'activity',
    title: 'Activity Logs',
    path: ROUTES.ACTIVITY,
    icon: HistoryOutlinedIcon,
  },
  {
    id: 'admins',
    title: 'Admin Management',
    path: ROUTES.ADMINS,
    icon: AdminPanelSettingsOutlinedIcon,
  },
  {
    id: 'settings',
    title: 'Settings',
    path: ROUTES.SETTINGS,
    icon: SettingsOutlinedIcon,
  },
];
