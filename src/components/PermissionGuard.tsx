import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Permission, hasPermission } from '../utils/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: Permission;
  fallbackPath?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackPath = '/dashboard',
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required permission
  if (!hasPermission(user.role, requiredPermission)) {
    // User doesn't have permission, redirect to fallback path
    return <Navigate to={fallbackPath} replace />;
  }

  // User has permission, render children
  return <>{children}</>;
};

export default PermissionGuard; 