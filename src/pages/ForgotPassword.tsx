import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(trimmed);
      setIsSubmitted(true);
    } catch {
      setError('Unable to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
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
        {isSubmitted ? (
          /* Confirmation Screen */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(52, 199, 123, 0.15)',
              border: '1px solid rgba(52, 199, 123, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: 'var(--success)',
            }}>
              <CheckCircle2 size={28} />
            </div>

            <h2 style={{
              fontSize: 21,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              margin: '0 0 8px',
            }}>
              Check your email
            </h2>

            <p style={{
              fontSize: 13.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}>
              If an account exists for <strong>{email}</strong>, password-reset instructions have been sent.
            </p>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 13.5,
              }}
            >
              <ArrowLeft size={14} /> Return to Sign In
            </Link>
          </div>
        ) : (
          /* Form Screen */
          <>
            <div style={{ marginBottom: 26, textAlign: 'left' }}>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
              }}>
                Reset your password
              </h2>
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Enter your email and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            {error && (
              <div className="alert alert--error" style={{ marginBottom: 18, fontSize: 13 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 22 }}>
                <label
                  htmlFor="forgot-email"
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
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 12,
                      background: 'var(--glass-bg)',
                      border: `1px solid ${error ? 'var(--danger)' : 'var(--glass-border)'}`,
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <Button
                id="btn-send-reset-link"
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '12px',
                }}
              >
                {isSubmitting ? 'Sending instructions...' : 'Send Reset Link'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
