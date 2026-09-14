export type UserRole =
  | 'Pharmacovigilance'
  | 'Regulatory Affairs'
  | 'Clinical Safety'
  | 'Quality Assurance'
  | 'Medical Affairs'
  | 'Research'
  | 'Other';

export interface User {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  role: UserRole;
  isDemoUser?: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
  isDemoMode: boolean;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  organization: string;
  role: UserRole;
  password?: string;
  confirmPassword?: string;
  agreeTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  password?: string;
  confirmPassword?: string;
  token?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  session?: AuthSession;
  error?: string;
  message?: string;
}
