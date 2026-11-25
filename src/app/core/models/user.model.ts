import { UserRole } from './auth.model';

export interface User {
  id: number;
  name: string;
  surname: string;
  documentNumber: string;
  username: string;
  role: UserRole;
  clubId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  surname: string;
  documentNumber: string;
  username: string;
  password: string;
  role: UserRole;
  clubId: number | null;
}
