import { useNavigate } from 'react-router-dom';
import {
  Upload, TrendingUp, User, ArrowRight,
  AlertTriangle, RotateCcw, Trash2,
  ShieldAlert, Activity, CheckCircle, ExternalLink,
} from 'lucide-react';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import Button from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { DEMO_PATIENT } from '../data/demoData';
import { computeModuleSummaries } from '../services/documents';

// ─── Stat Card Component ───────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string | null;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

function SummaryCard({ label, value, sub, icon, accent }: SummaryCardProps) {
  const isEmpty = value === null || value === undefined || value === '—' || value === '';
  return (
    <div className="glass-card" style={{
      padding: '20px 22px',
      position: 'relative',
      borderRadius: 18,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--text-tertiary)',
        }}>
          {label}
        </span>
        <span style={{
          width: 32, height: 32, borderRadius: 8, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: accent ?? 'var(--glass-bg-hover)',
          border: '1px solid var(--glass-border)',
          color: accent ? '#fff' : 'var(--text-tertiary)',
          flexShrink: 0,
        }}>
          {icon}
        </span>
      </div>
      <div>
        <div style={{
          fontSize: isEmpty ? 28 : 32,
          fontWeight: 700,
          color: isEmpty ? 'var(--text-tertiary)' : 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          marginBottom: 6,
        }}>
          {isEmpty ? '—' : value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {sub || (isEmpty ? 'No calculated result' : '')}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { adverseEvents, signals, documents } = state;

  const hasDemo = adverseEvents.some(e => e.isDemo);
  const hasEvents = adverseEvents.length > 0;

  // Format summary numbers: 01, 03 or '—'
  const uniquePatientsCount = new Set(
    adverseEvents.map(e => (e.patientId?.trim() || e.reportId.trim()).toLowerCase())
  ).size;
  const patientValue = hasEvents ? String(uniquePatientsCount).padStart(2, '0') : '—';
  const adverseEventsValue = hasEvents ? String(adverseEvents.length).padStart(2, '0') : '—';
  
  // Safety signals: strictly "—" if not calculated, or real signals if generated
  const safetySignalsValue = signals.length > 0 ? String(signals.length).padStart(2, '0') : '—';

  // Submission readiness: "—" if no documents uploaded, or real percentage
  const moduleSummaries = computeModuleSummaries(documents);
  const submissionReadinessValue = documents.length > 0
    ? `${Math.round(moduleSummaries.reduce((a, m) => a + m.completionPercentage, 0) / moduleSummaries.length)}%`
    : '—';

  return (
    <>
      <Header
        title="PharmaGuard AI"
        subtitle="Pharmaceutical Safety Intelligence"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          hasDemo ? (
            <Button
              id="clear-demo-header-btn"
              variant="danger"
              size="sm"
              icon={<Trash2 size={13} />}
              onClick={() => dispatch({ type: 'CLEAR_DEMO_DATA' })}
              title="Remove fictional demo records and return to empty state"
            >
              Clear Demo Data
            </Button>
          ) : (
            <Button
              id="load-demo-header-btn"
              variant="secondary"
              size="sm"
              icon={<RotateCcw size={13} />}
              onClick={() => dispatch({ type: 'LOAD_DEMO_DATA' })}
              title="Load single fictional patient demo"
            >
              Load Demo Patient
            </Button>
          )
        }
      />

      <div className="app-content fade-in" style={{
        maxWidth: 1140,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>

        {/* ── WELCOME CARD ──────────────────────────────────────────────── */}
        <div className="glass-card" style={{
          padding: '32px 36px',
          background: 'rgba(74, 143, 217, 0.05)',
          borderColor: 'rgba(74, 143, 217, 0.2)',
          borderRadius: 20,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle accent corner glow */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 280, height: 280,
            background: 'radial-gradient(circle, rgba(74, 143, 217, 0.12) 0%, rgba(74, 143, 217, 0) 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              {/* Badge: DEMO DATA */}
              {hasDemo && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px', borderRadius: 6,
                  background: 'rgba(245, 166, 35, 0.18)', border: '1px solid rgba(245, 166, 35, 0.35)',
                  fontSize: 11, fontWeight: 700, color: '#F5A623', marginBottom: 12,
                }}>
                  <ShieldAlert size={12} />
                  DEMO DATA
                </div>
              )}

              <h1 style={{
                fontSize: 22, fontWeight: 700, color: 'var(--text-primary)',
                letterSpacing: '-0.02em', marginBottom: 6,
              }}>
                Safety intelligence at a glance
              </h1>

              <p style={{
                fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 540,
                lineHeight: 1.6, margin: 0,
              }}>
                Analyze adverse events, identify potential safety signals, and evaluate regulatory submission readiness.
              </p>
            </div>

            {/* Primary Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              <Button
                id="btn-welcome-upload-data"
                variant="primary"
                icon={<Upload size={14} />}
                onClick={() => navigate('/adverse-events')}
              >
                Upload Data
              </Button>
              <Button
                id="btn-welcome-start-analysis"
                variant="secondary"
                icon={<TrendingUp size={14} />}
                onClick={() => navigate('/signal-analysis')}
              >
                Start Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* ── DEMO PATIENT CARD (1 Fictional Patient) ───────────────────── */}
        {hasDemo && (
          <div className="glass-card" style={{
            padding: '24px 28px',
            borderRadius: 18,
            border: '1px solid rgba(245, 166, 35, 0.25)',
            background: 'rgba(245, 166, 35, 0.03)',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--glass-border)',
              flexWrap: 'wrap', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(245, 166, 35, 0.15)', border: '1px solid rgba(245, 166, 35, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#F5A623',
                }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                    Fictional Patient
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                    {DEMO_PATIENT.patientId}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(245, 166, 35, 0.15)', border: '1px solid rgba(245, 166, 35, 0.3)',
                  fontSize: 11, fontWeight: 600, color: '#F5A623',
                }}>
                  Fictional Demo Patient
                </span>
                <button
                  id="btn-view-demo-patient"
                  onClick={() => navigate('/demo-data')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--glass-bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--glass-bg)')}
                >
                  Demo Data <ExternalLink size={12} />
                </button>
                <button
                  id="btn-view-demo-analysis"
                  onClick={() => navigate('/demo-analysis')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 12px', borderRadius: 8,
                    background: 'rgba(74, 143, 217, 0.15)', border: '1px solid rgba(74, 143, 217, 0.35)',
                    color: 'var(--text-accent)', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74, 143, 217, 0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74, 143, 217, 0.15)')}
                >
                  Demo Analysis <ExternalLink size={12} />
                </button>
              </div>
            </div>

            {/* Fictional Patient Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Age</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{DEMO_PATIENT.age}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Sex</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{DEMO_PATIENT.sex}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Country</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{DEMO_PATIENT.country}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Drug / Product</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-accent)' }}>{DEMO_PATIENT.drug}</div>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--glass-bg)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 2 }}>Indication</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{DEMO_PATIENT.indication}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── SUMMARY CARDS (4) ─────────────────────────────────────────── */}
        <div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12,
          }}>
            Overview Metrics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {/* Card 1: Patient */}
            <SummaryCard
              label="Patient"
              value={patientValue}
              sub={
                hasDemo && adverseEvents.length === 3
                  ? 'Single fictional patient (DEMO-001)'
                  : (hasEvents ? `${uniquePatientsCount} registered patient${uniquePatientsCount !== 1 ? 's' : ''}` : undefined)
              }
              icon={<User size={16} />}
            />

            {/* Card 2: Adverse Events */}
            <SummaryCard
              label="Adverse Events"
              value={adverseEventsValue}
              sub={
                hasDemo && adverseEvents.length === 3
                  ? 'Headache, Dizziness, Nausea'
                  : (hasEvents ? `${adverseEvents.length} recorded case report${adverseEvents.length !== 1 ? 's' : ''}` : undefined)
              }
              icon={<AlertTriangle size={16} />}
            />

            {/* Card 3: Safety Signals */}
            <SummaryCard
              label="Safety Signals"
              value={safetySignalsValue}
              sub={safetySignalsValue !== '—' ? `${signals.length} algorithmic signals` : 'No calculated result'}
              icon={<TrendingUp size={16} />}
              accent={signals.length > 0 ? 'var(--warning)' : undefined}
            />

            {/* Card 4: Submission Readiness */}
            <SummaryCard
              label="Submission Readiness"
              value={submissionReadinessValue}
              sub={documents.length > 0 ? `${documents.length} CTD documents` : 'No calculated result'}
              icon={<CheckCircle size={16} />}
              accent={documents.length > 0 ? 'var(--success)' : undefined}
            />
          </div>
        </div>

        {/* ── 2-COLUMN SECTION: Recent AE Table + Safety Signal Analysis ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, alignItems: 'start' }}>

          {/* ── ADVERSE EVENT SECTION (Recent Adverse Events) ──────────── */}
          <div className="glass-card" style={{ borderRadius: 18, overflow: 'hidden' }}>
            <div style={{
              padding: '18px 22px', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Recent Adverse Events
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Safety event records associated with current dataset
                </div>
              </div>
              <button
                onClick={() => navigate('/adverse-events')}
                style={{
                  background: 'none', border: 'none', color: 'var(--accent)',
                  fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                View all <ArrowRight size={13} />
              </button>
            </div>

            {hasEvents ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                      {['Event', 'Drug', 'Seriousness', 'Outcome'].map(h => (
                        <th key={h} style={{
                          padding: '10px 18px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: 'var(--text-tertiary)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adverseEvents.slice(0, 5).map(ae => (
                      <tr
                        key={ae.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.035)', transition: 'background 120ms' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {ae.eventDescription}
                        </td>
                        <td style={{ padding: '12px 18px', color: 'var(--text-secondary)' }}>
                          {ae.drugName}
                        </td>
                        <td style={{ padding: '12px 18px' }}>
                          <StatusBadge
                            variant={ae.seriousness ? 'danger' : 'neutral'}
                            label={ae.seriousness ? 'Serious' : 'Non-serious'}
                            dot
                          />
                        </td>
                        <td style={{ padding: '12px 18px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          <StatusBadge
                            variant={ae.outcome === 'recovered' ? 'success' : 'info'}
                            label={ae.outcome}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                No adverse events recorded yet.
              </div>
            )}
          </div>

          {/* ── SAFETY SIGNAL SECTION ──────────────────────────────────── */}
          <div className="glass-card" style={{ padding: '22px 24px', borderRadius: 18 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--glass-border)',
            }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Safety Signal Analysis
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Disproportionality &amp; ROR evaluation
                </div>
              </div>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--accent-muted)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={15} />
              </div>
            </div>

            {signals.length === 0 ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', padding: '24px 12px', gap: 12,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-tertiary)',
                }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Analysis not available
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: 260 }}>
                    Run safety analysis after reviewing the dataset.
                  </div>
                </div>
                <Button
                  id="btn-analyze-data-dashboard"
                  variant="primary"
                  size="sm"
                  icon={<TrendingUp size={13} />}
                  onClick={() => navigate('/signal-analysis')}
                  style={{ marginTop: 6 }}
                >
                  Analyze Data
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {signals.slice(0, 3).map(sig => (
                  <div key={sig.id} style={{
                    padding: '12px 14px', background: 'var(--glass-bg)',
                    borderRadius: 10, border: '1px solid var(--glass-border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{sig.eventTerm}</span>
                      <StatusBadge variant={sig.priority === 'critical' ? 'danger' : 'warning'} label={sig.priority} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{sig.drugName}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
                      <span>PRR: <strong>{(sig.proportionalReportingRatio ?? 1.0).toFixed(1)}</strong></span>
                      <span>ROR: <strong>{sig.reportingOddsRatio.toFixed(1)}</strong></span>
                      <span>Cases: <strong>{sig.caseCount}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </>
  );
}
