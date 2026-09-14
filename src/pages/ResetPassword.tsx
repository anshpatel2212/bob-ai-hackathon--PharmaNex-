import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password Requirement Checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.password = 'Please enter a new password.';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet all security requirements.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const res = await resetPassword(newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrors({ general: res.message || 'Unable to reset password.' });
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
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
        {isSuccess ? (
          /* Success Screen */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
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
              Password updated successfully
            </h2>

            <p style={{
              fontSize: 13.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 24,
            }}>
              Your account password has been reset. You can now sign in with your new credentials.
            </p>

            <Button
              id="btn-return-sign-in"
              variant="primary"
              size="lg"
              icon={<ArrowRight size={14} />}
              onClick={() => navigate('/login')}
              style={{ width: '100%', borderRadius: 12 }}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          /* Form Screen */
          <>
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <h2 style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
              }}>
                Create a new password
              </h2>
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                Please choose a strong password according to security criteria.
              </p>
            </div>

            {errors.general && (
              <div className="alert alert--error" style={{ marginBottom: 18, fontSize: 13 }}>
                <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                <span>{errors.general}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* New Password */}
              <div style={{ marginBottom: 10 }}>
                <label
                  htmlFor="reset-new-password"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 5,
                  }}
                >
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: 12,
                      background: 'var(--glass-bg)',
                      border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--glass-border)'}`,
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Dynamic Password Requirements */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--glass-border)',
                borderRadius: 10,
                padding: '10px 12px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                  Password must contain:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 10px', fontSize: 11.5 }}>
                  {[
                    { valid: hasMinLength, label: '8 characters' },
                    { valid: hasUppercase, label: 'Uppercase letter' },
                    { valid: hasLowercase, label: 'Lowercase letter' },
                    { valid: hasNumber, label: 'Number' },
                  ].map(req => (
                    <div
                      key={req.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: req.valid ? 'var(--success)' : 'var(--text-tertiary)',
                        fontWeight: req.valid ? 600 : 400,
                      }}
                    >
                      <span style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: req.valid ? 'rgba(52, 199, 123, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${req.valid ? 'var(--success)' : 'var(--glass-border)'}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {req.valid ? <Check size={9} /> : <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-tertiary)' }} />}
                      </span>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm New Password */}
              <div style={{ marginBottom: 22 }}>
                <label
                  htmlFor="reset-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 5,
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 14px',
                      borderRadius: 12,
                      background: 'var(--glass-bg)',
                      border: `1px solid ${errors.confirmPassword ? 'var(--danger)' : 'var(--glass-border)'}`,
                      color: 'var(--text-primary)',
                      fontSize: 13.5,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                id="btn-reset-password"
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
                {isSubmitting ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <Link
                to="/login"
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Return to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
