import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, TrendingUp,
  FileText, Search, BarChart2, Settings,
  Shield, X, Users, User, LogOut,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { user, isDemoMode, logout } = useAuth();
  const hasDemo = state.adverseEvents.some(e => e.isDemo);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'DEMO MODE' },
    { to: '/demo-data', label: 'Demo Data', icon: Users, isDemo: hasDemo },
    { to: '/demo-analysis', label: 'Demo Analysis', icon: TrendingUp, isDemo: hasDemo },
    { section: 'SAFETY' },
    { to: '/adverse-events', label: 'Adverse Events', icon: AlertTriangle },
    { to: '/signal-analysis', label: 'Signal Analysis', icon: TrendingUp },
    { section: 'SUBMISSION' },
    { to: '/ctd-documents', label: 'CTD Documents', icon: FileText },
    { to: '/gap-detection', label: 'Gap Detection', icon: Search },
    { section: 'REPORTS' },
    { to: '/reports', label: 'AI Reports', icon: BarChart2 },
    { section: 'SYSTEM' },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const displayName = user?.fullName || state.userName || 'Safety Reviewer';
  const roleSubtitle = isDemoMode ? 'Demo Session' : (user?.role || 'Pharmacovigilance');

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ width: 240 }}>
        {/* Logo */}
        <div className="sidebar-logo" style={{ padding: '20px 18px', borderBottom: '1px solid var(--glass-border)' }}>
          <div className="sidebar-logo-icon">
            <Shield size={16} color="#fff" />
          </div>
          <div>
            <div className="sidebar-logo-text" style={{ fontSize: 13, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              PharmaGuard AI
            </div>
            <div className="sidebar-logo-sub" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Safety &amp; Regulatory
            </div>
          </div>
          {/* Close on mobile */}
          <button
            onClick={onMobileClose}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-secondary)', display: 'none',
              padding: 4,
            }}
            className="mobile-close-btn"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('section' in item && item.section) {
              return (
                <div
                  key={`section-${i}`}
                  className="sidebar-section-label"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--text-tertiary)',
                    padding: '16px 10px 6px',
                  }}
                >
                  {item.section}
                </div>
              );
            }
            if (!('to' in item) || !item.to) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onMobileClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  transition: 'all 120ms ease',
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.isDemo && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'rgba(245,166,35,0.2)',
                    color: '#F5A623',
                    border: '1px solid rgba(245,166,35,0.35)',
                  }}>
                    DEMO
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: User Profile */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(255,255,255,0.015)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: isDemoMode ? 'linear-gradient(135deg, #F5A623 0%, #d48815 100%)' : 'linear-gradient(135deg, var(--accent) 0%, #6CB8FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}>
            <User size={15} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.2, marginTop: 2 }}>
              {roleSubtitle}
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              padding: 4,
              transition: 'color 120ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>
    </>
  );
}
