import { Role } from '../types/user';

export enum Permission {
  // Treatment permissions
  CREATE_TREATMENT = 'create:treatment',
  READ_TREATMENT = 'read:treatment',
  UPDATE_TREATMENT = 'update:treatment',
  DELETE_TREATMENT = 'delete:treatment',

  // Treatment Options permissions
  CREATE_TREATMENT_OPTION = 'create:treatment_option',
  READ_TREATMENT_OPTION = 'read:treatment_option',
  UPDATE_TREATMENT_OPTION = 'update:treatment_option',
  DELETE_TREATMENT_OPTION = 'delete:treatment_option',

  // Medication permissions
  CREATE_MEDICATION = 'create:medication',
  READ_MEDICATION = 'read:medication',
  UPDATE_MEDICATION = 'update:medication',
  DELETE_MEDICATION = 'delete:medication',

  // User management permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'read:user',
  DELETE_USER = 'delete:user',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.DOCTOR]: [
    Permission.CREATE_TREATMENT,
    Permission.READ_TREATMENT,
    Permission.UPDATE_TREATMENT,
    Permission.READ_TREATMENT_OPTION,
    Permission.READ_MEDICATION,
  ],
  [Role.NURSE]: [
    Permission.READ_TREATMENT,
    Permission.READ_TREATMENT_OPTION,
    Permission.READ_MEDICATION,
  ],
  [Role.STAFF]: [
    Permission.READ_TREATMENT,
    Permission.READ_TREATMENT_OPTION,
    Permission.READ_MEDICATION,
  ],
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (role: Role, permission: Permission): boolean => {
  const permissions = RolePermissions[role];
  return permissions.includes(permission);
};

/**
 * Check if a user has any of the specified permissions
 */
export const hasAnyPermission = (role: Role, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(role, permission));
}; 