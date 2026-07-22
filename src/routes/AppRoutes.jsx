import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import AccessDenied from '../components/common/AccessDenied';
import ProtectedPermission from '../components/rbac/ProtectedPermission';
import { ROUTES } from '../constants/routes';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../models/rbacModel';

// Lazy-loaded Pages for Route Code-Splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const BooksPage = lazy(() => import('../pages/books/BooksPage'));
const RequestsPage = lazy(() => import('../pages/requests/RequestsPage'));
const ReturnsPage = lazy(() => import('../pages/returns/ReturnsPage'));
const StudentsPage = lazy(() => import('../pages/students/StudentsPage'));
const ScannerPage = lazy(() => import('../pages/scanner/ScannerPage'));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
const ActivityPage = lazy(() => import('../pages/activity/ActivityPage'));
const AdminManagementPage = lazy(() => import('../pages/admin/AdminManagementPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading Borrow Portal..." />}>
      <Routes>
        {/* Public Route */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Protected App Layout Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.BOOKS} element={<BooksPage />} />
          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.RETURNS} element={<ReturnsPage />} />
          <Route path={ROUTES.STUDENTS} element={<StudentsPage />} />
          <Route path={ROUTES.SCANNER} element={<ScannerPage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />

          {/* Activity Logs (Protected View Permission) */}
          <Route
            path={ROUTES.ACTIVITY}
            element={
              <ProtectedPermission module={PERMISSION_MODULES.ACTIVITY} action={PERMISSION_ACTIONS.VIEW} fallback={<AccessDenied />}>
                <ActivityPage />
              </ProtectedPermission>
            }
          />

          {/* Admin Management (Protected View Permission) */}
          <Route
            path={ROUTES.ADMINS}
            element={
              <ProtectedPermission module={PERMISSION_MODULES.ADMINS} action={PERMISSION_ACTIONS.VIEW} fallback={<AccessDenied />}>
                <AdminManagementPage />
              </ProtectedPermission>
            }
          />

          {/* Settings (Protected View Permission) */}
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedPermission module={PERMISSION_MODULES.SETTINGS} action={PERMISSION_ACTIONS.VIEW} fallback={<AccessDenied />}>
                <SettingsPage />
              </ProtectedPermission>
            }
          />

          {/* Index Redirection */}
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
