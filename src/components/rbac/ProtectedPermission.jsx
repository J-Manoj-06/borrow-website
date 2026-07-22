import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

export const ProtectedPermission = ({
  module,
  action,
  role,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasRole } = useRBAC();

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (module && action && !hasPermission(module, action)) {
    return fallback;
  }

  return <>{children}</>;
};

export default ProtectedPermission;
