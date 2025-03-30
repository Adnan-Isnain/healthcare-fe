export enum Role {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  STAFF = 'STAFF'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserForm {
  id: string;
  name?: string;
  email?: string;
  role?: Role;
}