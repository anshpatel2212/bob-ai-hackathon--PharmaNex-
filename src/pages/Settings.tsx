import { useState } from 'react';
import { Trash2, RotateCcw, Moon, Sun, User, Info } from 'lucide-react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { Input } from '../components/Input';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext';
import { APP_NAME, API_VERSION } from '../services/api';

export default function Settings({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { state, dispatch } = useAppContext();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [userName, setUserName] = useState(state.userName);

  function handleSaveUserName() {
    if (userName.trim()) dispatch({ type: 'SET_USER_NAME', payload: userName.trim() });
  }

  function handleReset() {
    dispatch({ type: 'RESET_ALL' });
    setShowResetConfirm(false);
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Application preferences"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div className="app-content fade-in">
        <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* Profile */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <User size={16} style={{ color: 'var(--accent)' }} />
              <div className="section-title">User Profile</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <Input
                id="settings-username"
                label="Display Name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Pharmacovigilance Team"
              />
              <div className="text-secondary text-sm">
                This name appears in generated reports.
              </div>
              <Button id="save-username-btn" variant="primary" onClick={handleSaveUserName}
                disabled={!userName.trim() || userName.trim() === state.userName}>
                Save Name
              </Button>
            </div>
          </GlassCard>

          {/* Appearance */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              {state.theme === 'dark' ? <Moon size={16} style={{ color: 'var(--accent)' }} /> : <Sun size={16} style={{ color: 'var(--warning)' }} />}
              <div className="section-title">Appearance</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                <button
                  id="theme-dark-btn"
                  onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}
                  style={{
                    flex: 1, padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                    background: state.theme === 'dark' ? 'var(--accent-muted)' : 'var(--glass-bg)',
                    border: `1px solid ${state.theme === 'dark' ? 'var(--accent-border)' : 'var(--glass-border)'}`,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <div style={{ width: 48, height: 28, borderRadius: 6, background: '#07101f', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Dark Glass</span>
                </button>
                <button
                  id="theme-light-btn"
                  onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}
                  style={{
                    flex: 1, padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
                    background: state.theme === 'light' ? 'var(--accent-muted)' : 'var(--glass-bg)',
                    border: `1px solid ${state.theme === 'light' ? 'var(--accent-border)' : 'var(--glass-border)'}`,
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  }}
                >
                  <div style={{ width: 48, height: 28, borderRadius: 6, background: '#f0f4f8', border: '1px solid rgba(0,0,0,0.1)' }} />
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Light Glass</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Demo Data Management */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <User size={16} style={{ color: 'var(--accent)' }} />
              <div className="section-title">Fictional Demo Patient Dataset</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>
                For evaluation and interface demonstration only. Contains exactly <strong>one fictional patient (DEMO-001)</strong> with 3 related non-serious adverse events. No real patient data.
              </div>

              <div style={{
                padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div className="text-primary text-sm font-semibold">Demo Patient: DEMO-001</div>
                  <div className="text-tertiary text-xs" style={{ marginTop: 2 }}>
                    45 y/o Male · India · DemoDrug-100 (50mg daily) · 3 adverse events
                  </div>
                </div>
                <span className={state.adverseEvents.some(e => e.isDemo) ? 'badge badge--success' : 'badge badge--neutral'}>
                  {state.adverseEvents.some(e => e.isDemo) ? 'Loaded' : 'Cleared'}
                </span>
              </div>

              <div className="flex gap-sm">
                {state.adverseEvents.some(e => e.isDemo) ? (
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={13} />}
                    onClick={() => dispatch({ type: 'CLEAR_DEMO_DATA' })}
                  >
                    Clear Demo Patient
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      dispatch({ type: 'LOAD_DEMO_DATA' });
                    }}
                  >
                    Restore Demo Patient
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Regulatory Standards */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <Info size={16} style={{ color: 'var(--accent)' }} />
              <div className="section-title">Regulatory Frameworks & Analysis Parameters</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: 'ICH E2B(R3)', desc: 'Electronic Transmission of Individual Case Safety Reports (ICSRs)' },
                { name: 'ICH M4 / eCTD', desc: 'Common Technical Document format for drug dossier submissions' },
                { name: 'FDA 21 CFR 314.80', desc: 'Postmarketing reporting of adverse drug experiences' },
                { name: 'EMA GVP Module IX', desc: 'Good Pharmacovigilance Practices — Signal management' },
              ].map(f => (
                <div key={f.name} style={{
                  padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                }}>
                  <div className="text-primary text-sm font-semibold">{f.name}</div>
                  <div className="text-secondary text-xs" style={{ marginTop: 2 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Data Management */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <Trash2 size={16} style={{ color: 'var(--danger)' }} />
              <div className="section-title">Session Data Management</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>
                All data lives in your browser session only. It is never sent to any server.
                Resetting will permanently clear all adverse events, signals, documents, and reports
                from this session.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', marginTop: 4 }}>
                {[
                  { label: 'Adverse Events', value: state.adverseEvents.length },
                  { label: 'Signals', value: state.signals.length },
                  { label: 'Documents', value: state.documents.length },
                  { label: 'Reports', value: state.reports.length },
                  { label: 'Uploads', value: state.aeUploadHistory.length },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    padding: '8px 12px', background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)',
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    <div className="text-tertiary text-sm">{label}</div>
                  </div>
                ))}
              </div>
              <Button
                id="reset-data-btn"
                variant="danger"
                icon={<RotateCcw size={13} />}
                onClick={() => setShowResetConfirm(true)}
                disabled={state.adverseEvents.length === 0 && state.signals.length === 0 && state.documents.length === 0 && state.reports.length === 0}
              >
                Reset All Session Data
              </Button>
            </div>
          </GlassCard>

          {/* About */}
          <GlassCard className="p-xl">
            <div className="flex items-center gap-sm mb-lg">
              <Info size={16} style={{ color: 'var(--info)' }} />
              <div className="section-title">About</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Application', value: APP_NAME },
                { label: 'Version', value: `v${API_VERSION}` },
                { label: 'Mode', value: 'Client-Side · No Backend' },
                { label: 'Standards', value: 'ICH E2B · ICH M4 CTD · ICH E6 GCP' },
                { label: 'Signal Method', value: 'Reporting Odds Ratio (ROR) · IC' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center" style={{
                  padding: '7px 0', borderBottom: '1px solid var(--glass-border)',
                }}>
                  <span className="text-secondary text-sm">{label}</span>
                  <span className="text-primary text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Reset Confirm Modal */}
      <Modal
        open={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset All Data"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button id="confirm-reset-btn" variant="danger" onClick={handleReset}>Reset Everything</Button>
          </>
        }
      >
        <div className="text-secondary" style={{ lineHeight: 1.7 }}>
          This will permanently clear all data from the current session, including:
          <ul style={{ marginTop: 12, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>{state.adverseEvents.length} adverse event{state.adverseEvents.length !== 1 ? 's' : ''}</li>
            <li>{state.signals.length} safety signal{state.signals.length !== 1 ? 's' : ''}</li>
            <li>{state.documents.length} CTD document{state.documents.length !== 1 ? 's' : ''}</li>
            <li>{state.reports.length} report{state.reports.length !== 1 ? 's' : ''}</li>
          </ul>
          <div className="alert alert--warning" style={{ marginTop: 16 }}>
            This action cannot be undone.
          </div>
        </div>
      </Modal>
    </>
  );
}
