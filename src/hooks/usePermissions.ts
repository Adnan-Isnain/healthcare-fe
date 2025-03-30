import { useAuth } from '../context/AuthContext';
import { Permission, hasPermission, hasAnyPermission } from '../utils/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  return {
    /**
     * Check if the current user has a specific permission
     */
    can: (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },

    /**
     * Check if the current user has any of the specified permissions
     */
    canAny: (permissions: Permission[]): boolean => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions);
    },

    /**
     * Get the current user's role
     */
    role: user?.role,
  };
}; 