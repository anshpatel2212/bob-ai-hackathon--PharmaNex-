import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, AlertTriangle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useAppContext } from '../context/AppContext';
import type { UserRole } from '../types/auth';

const ROLES: UserRole[] = [
  'Pharmacovigilance',
  'Regulatory Affairs',
  'Clinical Safety',
  'Quality Assurance',
  'Medical Affairs',
  'Research',
  'Other',
];

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { dispatch } = useAppContext();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('Pharmacovigilance');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field Errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    organization?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Requirement Checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  function validate(): boolean {
    const newErrors: typeof errors = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedOrg = organization.trim();

    if (!trimmedName) {
      newErrors.fullName = 'Please enter your full name.';
    }

    if (!trimmedEmail) {
      newErrors.email = 'Please enter your work email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!trimmedOrg) {
      newErrors.organization = 'Please enter your organization name.';
    }

    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet all security requirements.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Please accept the Terms of Service.';
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
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        organization: organization.trim(),
        role,
        password,
        confirmPassword,
        agreeTerms,
      });

      if (res.success && res.user) {
        setSuccessMessage('Account created successfully');
        dispatch({ type: 'SET_USER_NAME', payload: res.user.fullName });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setErrors({ general: res.error || 'Unable to create account. Please try again.' });
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
        {/* Header */}
        <div style={{ marginBottom: 24, textAlign: 'left' }}>
          <h2 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}>
            Create your PharmaGuard AI account
          </h2>
          <p style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            Set up your workspace to begin pharmaceutical safety analysis.
          </p>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="alert alert--success" style={{ marginBottom: 20, fontSize: 13 }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {errors.general && (
          <div className="alert alert--error" style={{ marginBottom: 20, fontSize: 13 }}>
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="reg-name"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 5,
              }}
            >
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={fullName}
              onChange={e => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--glass-bg)',
                border: `1px solid ${errors.fullName ? 'var(--danger)' : 'var(--glass-border)'}`,
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            {errors.fullName && (
              <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                {errors.fullName}
              </div>
            )}
          </div>

          {/* Work Email */}
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="reg-email"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 5,
              }}
            >
              Work Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="Enter your work email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                background: 'var(--glass-bg)',
                border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--glass-border)'}`,
                color: 'var(--text-primary)',
                fontSize: 13.5,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            {errors.email && (
              <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                {errors.email}
              </div>
            )}
          </div>

          {/* 2-Column: Organization & Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label
                htmlFor="reg-org"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 5,
                }}
              >
                Organization
              </label>
              <input
                id="reg-org"
                type="text"
                placeholder="Enter organization name"
                value={organization}
                onChange={e => {
                  setOrganization(e.target.value);
                  if (errors.organization) setErrors(prev => ({ ...prev, organization: undefined }));
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: `1px solid ${errors.organization ? 'var(--danger)' : 'var(--glass-border)'}`,
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {errors.organization && (
                <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                  {errors.organization}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-role"
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: 5,
                }}
              >
                Role
              </label>
              <select
                id="reg-role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: 13.5,
                  outline: 'none',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                {ROLES.map(r => (
                  <option key={r} value={r} style={{ background: '#0d1e38', color: '#fff' }}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="reg-password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 5,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
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
            marginBottom: 14,
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

          {/* Confirm Password */}
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="reg-confirm-password"
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 5,
              }}
            >
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
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

          {/* Terms Checkbox */}
          <div style={{ marginBottom: 22 }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 9,
              cursor: 'pointer',
              fontSize: 12.5,
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              userSelect: 'none',
            }}>
              <input
                id="reg-agree-terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={e => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: undefined }));
                }}
                style={{
                  accentColor: 'var(--accent)',
                  width: 15,
                  height: 15,
                  marginTop: 2,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <span>
                I agree to the <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Privacy Policy</span>.
              </span>
            </label>
            {errors.agreeTerms && (
              <div style={{ color: 'var(--danger)', fontSize: 11.5, marginTop: 4 }}>
                {errors.agreeTerms}
              </div>
            )}
          </div>

          {/* Create Account Button */}
          <Button
            id="btn-create-account"
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || isLoading}
            style={{
              width: '100%',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              padding: '12px',
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        {/* Link back to Sign In */}
        <div style={{
          textAlign: 'center',
          marginTop: 20,
          fontSize: 13,
          color: 'var(--text-secondary)',
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            id="link-sign-in"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
