import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary, #090e17)',
        color: 'var(--text-primary, #f1f5f9)',
        fontFamily: 'inherit',
        padding: 24,
      }}>
        <div style={{
          padding: '40px 48px',
          borderRadius: 24,
          background: 'rgba(16, 26, 46, 0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          maxWidth: 380,
          textAlign: 'center',
        }}>
          <div style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
          }}>
            <Shield size={28} color="#ffffff" />
            <div style={{
              position: 'absolute',
              inset: -4,
              borderRadius: 20,
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
            }} />
          </div>

          <div>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              marginBottom: 6,
            }}>
              PharmaGuard AI
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary, #94a3b8)',
              lineHeight: 1.4,
            }}>
              Verifying secure session credentials...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
