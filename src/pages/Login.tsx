import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert, ArrowRight, Lock, Mail, AlertTriangle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../context/AppContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginDemo, isLoading, isAuthenticated, sessionExpiredMessage, clearSessionExpiredMessage } = useAuth();
  const { dispatch } = useAppContext();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  function validate(): boolean {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    return isValid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearSessionExpiredMessage();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await login({ email: email.trim(), password, rememberMe });
      if (res.success && res.user) {
        dispatch({ type: 'SET_USER_NAME', payload: res.user.fullName });
        navigate('/dashboard');
      } else {
        setGeneralError(res.error || 'Invalid email or password.');
      }
    } catch {
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleExploreDemo() {
    setIsDemoSubmitting(true);
    setGeneralError(null);
    try {
      const res = await loginDemo();
      if (res.success && res.user) {
        // Load the isolated single fictional patient DEMO-001
        dispatch({ type: 'LOAD_DEMO_DATA' });
        dispatch({ type: 'SET_USER_NAME', payload: res.user.fullName });
        navigate('/dashboard');
      } else {
        setGeneralError('Unable to enter demo mode. Please try again.');
      }
    } catch {
      setGeneralError('Something went wrong. Please try again.');
    } finally {
      setIsDemoSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="glass-card fade-in" style={{
        padding: '36px 36px 32px',
        borderRadius: 24,
        background: 'rgba(16, 26, 46, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.45)',
      }}>
        {/* Card Header */}
        <div style={{ marginBottom: 26, textAlign: 'left' }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}>
            Welcome back
          </h2>
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Sign in to continue to PharmaGuard AI
          </p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpiredMessage && !generalError && (
          <div className="alert alert--warning" style={{
            marginBottom: 20,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(234, 179, 8, 0.12)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#fde047',
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{sessionExpiredMessage}</span>
          </div>
        )}

        {/* Global Error Alert */}
        {generalError && (
          <div className="alert alert--error" style={{ marginBottom: 20, fontSize: 13 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6,
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                display: 'flex',
              }}>
                <Mail size={15} />
              </span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: `1px solid ${emailError ? 'var(--danger)' : 'var(--glass-border)'}`,
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease',
                }}
                onFocus={e => (e.target.style.borderColor = emailError ? 'var(--danger)' : 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = emailError ? 'var(--danger)' : 'var(--glass-border)')}
              />
            </div>
            {emailError && (
              <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 5 }}>
                {emailError}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
                display: 'flex',
              }}>
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                style={{
                  width: '100%',
                  padding: '11px 42px 11px 40px',
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: `1px solid ${passwordError ? 'var(--danger)' : 'var(--glass-border)'}`,
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease',
                }}
                onFocus={e => (e.target.style.borderColor = passwordError ? 'var(--danger)' : 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = passwordError ? 'var(--danger)' : 'var(--glass-border)')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex',
                  padding: 4,
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {passwordError && (
              <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 5 }}>
                {passwordError}
              </div>
            )}
          </div>

          {/* Options: Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
            fontSize: 12.5,
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              userSelect: 'none',
            }}>
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{
                  accentColor: 'var(--accent)',
                  width: 14,
                  height: 14,
                  cursor: 'pointer',
                }}
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#7ab7ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--accent)')}
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <Button
            id="btn-sign-in"
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || isDemoSubmitting || isLoading}
            style={{
              width: '100%',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              padding: '12px',
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Don't have an account? Create account */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            id="link-create-account"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Create account
          </Link>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          margin: '22px 0 18px',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
        </div>

        {/* Demo Access Option */}
        <div style={{
          background: 'rgba(245, 166, 35, 0.05)',
          border: '1px solid rgba(245, 166, 35, 0.22)',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#F5A623',
              marginBottom: 2,
            }}>
              <ShieldAlert size={11} />
              CONTROLLED EVALUATION
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Explore with single fictional patient <strong>DEMO-001</strong>
            </div>
          </div>

          <Button
            id="btn-explore-demo"
            type="button"
            variant="secondary"
            size="sm"
            loading={isDemoSubmitting}
            disabled={isSubmitting || isDemoSubmitting}
            icon={<ArrowRight size={13} />}
            onClick={handleExploreDemo}
            style={{
              borderColor: 'rgba(245, 166, 35, 0.4)',
              color: '#F5A623',
              whiteSpace: 'nowrap',
            }}
          >
            {isDemoSubmitting ? 'Entering…' : 'Explore Demo'}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
