import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Sun, Moon, Search, Bell, User, X, LogOut, ShieldAlert,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMobileMenuOpen: () => void;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, onMobileMenuOpen, actions }: HeaderProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { user, isDemoMode, logout } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');

  function toggleTheme() {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  }

  const criticalSignalsCount = state.signals.filter(s => s.priority === 'critical').length;
  const displayName = user?.fullName || state.userName || 'Safety Reviewer';

  return (
    <header className="header" style={{
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: 16,
    }}>
      {/* ── Left: Mobile button + Title ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
        <button
          className="sidebar-mobile-toggle"
          onClick={onMobileMenuOpen}
          aria-label="Open navigation menu"
          id="mobile-menu-toggle"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 8,
            width: 36,
            height: 36,
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <Menu size={17} />
        </button>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontSize: 11.5,
              color: 'var(--text-secondary)',
              marginTop: 2,
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* ── Center: Search Bar ──────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        maxWidth: 380,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 10,
        padding: '6px 12px',
        gap: 8,
        transition: 'all 150ms ease',
      }}>
        <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          id="global-header-search"
          type="text"
          placeholder="Search safety events, drugs, signals..."
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && globalSearch.trim()) {
              navigate('/adverse-events');
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 12.5,
            fontFamily: 'inherit',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Right: Status, Actions, Notifications, Avatar ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {actions}

        {/* DEMO MODE Badge */}
        {isDemoMode && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 20,
            background: 'rgba(245, 166, 35, 0.15)',
            border: '1px solid rgba(245, 166, 35, 0.38)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#F5A623',
          }}>
            <ShieldAlert size={12} />
            DEMO MODE
          </div>
        )}

        {/* Small Status Indicator: System Ready */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          background: 'rgba(52, 199, 123, 0.09)',
          border: '1px solid rgba(52, 199, 123, 0.25)',
          fontSize: 11.5,
          fontWeight: 600,
          color: 'var(--success)',
          letterSpacing: '0.01em',
        }}>
          <span className="system-ready-dot" />
          System Ready
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-tooltip={state.theme === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
          id="theme-toggle"
        >
          {state.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>

        {/* Notifications */}
        <button
          id="header-notifications"
          aria-label="Notifications"
          onClick={() => navigate('/signal-analysis')}
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            position: 'relative',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
          }}
          title={criticalSignalsCount > 0 ? `${criticalSignalsCount} critical signal(s) need review` : 'No notifications'}
        >
          <Bell size={15} />
          {criticalSignalsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 7,
              right: 7,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--danger)',
            }} />
          )}
        </button>

        {/* User Profile / Avatar */}
        <button
          id="header-user-profile"
          aria-label="User settings"
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 10px 5px 6px',
            borderRadius: 9,
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg)'}
        >
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: isDemoMode ? 'linear-gradient(135deg, #F5A623 0%, #d48815 100%)' : 'linear-gradient(135deg, var(--accent) 0%, #6CB8FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}>
            <User size={13} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>{displayName}</span>
        </button>

        {/* Logout Button */}
        <Button
          id="header-logout-btn"
          variant="ghost"
          size="icon"
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          data-tooltip="Sign out"
          aria-label="Sign out"
        >
          <LogOut size={15} style={{ color: 'var(--text-tertiary)' }} />
        </Button>
      </div>
    </header>
  );
}
