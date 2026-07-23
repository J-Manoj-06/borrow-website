import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/common/LoadingScreen';
import { ROUTES } from '../constants/routes';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, accountStatus, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verifying librarian session & security status..." />;
  }

  if (!isAuthenticated || accountStatus !== 'Active') {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default ProtectedRoute;
