import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  User,
  AuthSession,
  LoginCredentials,
  RegisterData,
  AuthResult,
} from '../types/auth';
import { authService } from '../services/auth';

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  clearSessionExpiredMessage: () => void;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (data: RegisterData) => Promise<AuthResult>;
  loginDemo: () => Promise<AuthResult>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword(newPassword: string): Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Re-verify session on mount via GET /api/auth/me
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setSession({
              user: currentUser,
              token: 'httponly-cookie',
              expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              isDemoMode: currentUser.isDemoUser ?? false,
            });
          } else {
            setSession(null);
          }
        }
      } catch {
        if (isMounted) setSession(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for 401 session expiration from API client
    function handleUnauthorized(e: Event) {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setSession(null);
      setSessionExpiredMessage(
        customEvent.detail?.message || 'Your session has expired. Please sign in again.'
      );
    }

    window.addEventListener('pharmaguard:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('pharmaguard:unauthorized', handleUnauthorized);
    };
  }, []);

  function clearSessionExpiredMessage() {
    setSessionExpiredMessage(null);
  }

  async function login(credentials: LoginCredentials): Promise<AuthResult> {
    setIsLoading(true);
    setSessionExpiredMessage(null);
    try {
      const res = await authService.login(credentials);
      if (res.success && res.session) {
        setSession(res.session);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: RegisterData): Promise<AuthResult> {
    setIsLoading(true);
    setSessionExpiredMessage(null);
    try {
      const res = await authService.register(data);
      if (res.success && res.session) {
        setSession(res.session);
      }
      return res;
    } finally {
      setIsLoading(false);
    }
  }

  async function loginDemo(): Promise<AuthResult> {
    setIsLoading(true);
    setSessionExpiredMessage(null);
    try {
      // Controlled demonstration session (DEMO-001)
      const demoUser: User = {
        id: 'usr-demo-001',
        fullName: 'Dr. Alex Vance (Demo)',
        email: 'demo@pharmaguard.ai',
        organization: 'Global BioPharma Corp',
        role: 'Pharmacovigilance',
        isDemoUser: true,
        createdAt: new Date().toISOString(),
      };
      const demoSession: AuthSession = {
        user: demoUser,
        token: 'demo-session-token',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        isDemoMode: true,
      };
      setSession(demoSession);
      return { success: true, user: demoUser, session: demoSession };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout(): Promise<void> {
    setIsLoading(true);
    try {
      await authService.logout();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    return authService.requestPasswordReset(email);
  }

  async function resetPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    return authService.resetPassword(newPassword);
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isAuthenticated: !!session,
    isDemoMode: session?.isDemoMode ?? false,
    isLoading,
    sessionExpiredMessage,
    clearSessionExpiredMessage,
    login,
    register,
    loginDemo,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
