export type UserRole = 'ADMIN' | 'CLUB_MANAGER';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
  clubId: number | null;
}

export interface LogoutRequest {
  token: string;
}

export interface LogoutResponse {
  message: string;
}

export interface ClubInfo {
  id: number;
  name: string;
  crestUrl: string | null;
}

export interface MeResponse {
  id: number;
  name: string;
  surname: string;
  documentNumber: string;
  username: string;
  role: UserRole;
  club: ClubInfo | null;
}

export interface AuthSession {
  token: string;
  userId: number;
  username: string;
  role: UserRole;
  clubId: number | null;
}
