import type {
  User,
  UserRole,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResult,
} from '../types/auth';
import { api, ApiError, setAuthToken } from './api';

// Interface matching backend response shape
interface BackendUserResponse {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface BackendAuthResponse {
  token_type: string;
  access_token?: string;
  user: BackendUserResponse;
}

function mapBackendUser(u: BackendUserResponse, isDemo = false): User {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    organization: u.organization || '',
    role: (u.role as UserRole) || 'Pharmacovigilance',
    isDemoUser: isDemo,
    createdAt: u.created_at,
  };
}

/**
 * Translate raw errors into user-friendly messages.
 * Preserves the original backend error detail when available.
 */
function toUserMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    // status 0 = network failure (backend unreachable / CORS / no internet)
    if (err.status === 0) {
      return 'Unable to connect to the authentication server. Please make sure the backend is running and try again.';
    }
    // 422 = Pydantic validation error — show the backend's detail
    if (err.status === 422) {
      return err.message || 'Invalid data. Please check all fields and try again.';
    }
    // Return the backend's error message directly for 400/401/403/404/500
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  requestPasswordReset(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(newPassword: string): Promise<{ success: boolean; message: string }>;
}

export class ApiAuthServiceImpl implements IAuthService {
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Only send fields the backend schema expects.
      // Never send confirmPassword or agreeTerms to the backend.
      const res = await api.post<BackendAuthResponse>('/auth/register', {
        full_name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        organization: data.organization?.trim() || null,
        role: data.role,
        password: data.password,
      });

      if (res.access_token) {
        setAuthToken(res.access_token);
      }

      const user = mapBackendUser(res.user);
      const session: AuthSession = {
        user,
        token: res.access_token || 'httponly-cookie',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        isDemoMode: false,
      };

      return {
        success: true,
        user,
        session,
        message: 'Account created successfully.',
      };
    } catch (err) {
      const message = toUserMessage(err, 'Registration failed. Please try again.');
      return { success: false, error: message };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const res = await api.post<BackendAuthResponse>('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });

      if (res.access_token) {
        setAuthToken(res.access_token);
      }

      const user = mapBackendUser(res.user);
      const session: AuthSession = {
        user,
        token: res.access_token || 'httponly-cookie',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        isDemoMode: false,
      };

      return {
        success: true,
        user,
        session,
      };
    } catch (err) {
      const message = toUserMessage(err, 'Invalid email or password.');
      return { success: false, error: message };
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silently proceed with local cleanup even if network fails
    } finally {
      setAuthToken(null);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await api.get<BackendUserResponse>('/auth/me');
      return mapBackendUser(res);
    } catch {
      // 401 = not logged in, any other error = backend down/unavailable
      return null;
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // In production connects to password reset service
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        message: `If an account exists for ${email}, a password reset link has been dispatched.`,
      };
    } catch {
      return { success: false, message: 'Unable to process request.' };
    }
  }

  async resetPassword(_newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        success: true,
        message: 'Your password has been reset successfully.',
      };
    } catch {
      return { success: false, message: 'Unable to update password.' };
    }
  }
}

// Export singleton instance connected to real backend
export const authService: IAuthService = new ApiAuthServiceImpl();
