import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Activity, CheckCircle, AlertTriangle,
  BarChart3, FileText, ArrowRight, Clock, ChevronRight,
  Zap, TrendingUp, Target, AlertOctagon,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import Header from '../components/Header';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { useAppContext } from '../context/AppContext';

// ─── Demo & Default Metrics ───────────────────────────────────────────────────

const DEMO_METRICS = {
  riskScore: 78,
  totalSignals: 12,
  validatedSignals: 8,
  regulatoryReadiness: 84,
  criticalIssues: 3,
};

const RISK_DISTRIBUTION = [
  { name: 'High Risk',   value: 3, color: '#EF4444' },
  { name: 'Medium Risk', value: 5, color: '#F59E0B' },
  { name: 'Low Risk',    value: 4, color: '#22C55E' },
];

const READINESS_BARS = [
  { label: 'Safety Documentation',     pct: 92, color: '#22C55E' },
  { label: 'Clinical Evidence',         pct: 86, color: '#38BDF8' },
  { label: 'Regulatory Documentation', pct: 78, color: '#F59E0B' },
];

const CRITICAL_ITEMS = [
  {
    icon: <AlertOctagon size={15} />,
    title: '3 high-priority safety cases require review',
    badge: 'Critical',
    badgeVariant: 'danger' as const,
    route: '/signal-analysis',
  },
  {
    icon: <FileText size={15} />,
    title: 'Regulatory evidence gap detected',
    badge: 'Action Required',
    badgeVariant: 'warning' as const,
    route: '/gap-detection',
  },
  {
    icon: <FileText size={15} />,
    title: 'Submission documentation requires validation',
    badge: 'Action Required',
    badgeVariant: 'warning' as const,
    route: '/ctd-documents',
  },
];

const RECENT_ACTIVITY = [
  {
    icon: <Activity size={14} />,
    title: 'Safety analysis completed',
    sub: '12 signals analyzed',
    time: 'Just now',
  },
  {
    icon: <CheckCircle size={14} />,
    title: '8 signals validated',
    sub: 'Validation workflow completed',
    time: '2 min ago',
  },
  {
    icon: <BarChart3 size={14} />,
    title: 'Regulatory readiness assessed',
    sub: '84% readiness score calculated',
    time: '5 min ago',
  },
];

// ─── Animated Progress Bar Component ──────────────────────────────────────────

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = '0%';
    const t = setTimeout(() => {
      el.style.width = `${pct}%`;
    }, 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 100,
        height: 7,
        overflow: 'hidden',
        flex: 1,
      }}
    >
      <div
        ref={ref}
        style={{
          height: '100%',
          background: color,
          borderRadius: 100,
          transition: 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 10px ${color}55`,
        }}
      />
    </div>
  );
}

// ─── Custom Donut Tooltip ─────────────────────────────────────────────────────

interface TooltipEntry {
  name: string;
  value: number;
  payload: { color: string };
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: TooltipEntry[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: 'rgba(11, 21, 38, 0.96)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12.5,
        color: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <span style={{ color: item.payload.color, fontWeight: 700 }}>{item.name}</span>
      <span style={{ color: 'rgba(255, 255, 255, 0.6)', marginLeft: 8 }}>{item.value} signals</span>
    </div>
  );
}

// ─── KPI Card Component ───────────────────────────────────────────────────────

interface KPICardProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  status: string;
  statusColor: string;
  accentColor: string;
  onClick?: () => void;
}

function KPICard({ id, icon, label, value, status, statusColor, accentColor, onClick }: KPICardProps) {
  return (
    <div
      id={id}
      className="glass-card"
      onClick={onClick}
      style={{
        padding: '20px 22px',
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.45)';
        el.style.borderColor = accentColor + '55';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = '';
        el.style.boxShadow = '';
        el.style.borderColor = '';
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: accentColor + '20',
            border: `1px solid ${accentColor}35`,
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>

      <div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 6,
          }}
        >
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor,
              boxShadow: `0 0 6px ${statusColor}`,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{status}</span>
        </div>
      </div>

      <div
        style={{
          height: 3,
          borderRadius: 100,
          background: `linear-gradient(90deg, ${accentColor}80, ${accentColor}20)`,
        }}
      />
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function Dashboard({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { signals } = state;

  const totalSignals = signals.length > 0 ? signals.length : DEMO_METRICS.totalSignals;
  const validatedSignals = signals.filter(s => s.status === 'validated').length || DEMO_METRICS.validatedSignals;

  return (
    <>
      <style>{`
        .dashboard-kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 1100px) {
          .dashboard-kpi-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .dashboard-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 500px) {
          .dashboard-kpi-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-analysis-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .dashboard-analysis-row {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-bottom-row {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 18px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .dashboard-bottom-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Header
        title="PharmaGuard AI"
        subtitle="Safety Intelligence Platform"
        onMobileMenuOpen={onMobileMenuOpen}
      />

      <div
        className="app-content fade-in"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          padding: '24px 28px',
        }}
      >
        {/* ── 1. HERO AREA ───────────────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{
            padding: '28px 32px',
            borderRadius: 20,
            background: 'rgba(56, 189, 248, 0.04)',
            borderColor: 'rgba(56, 189, 248, 0.15)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(56, 189, 248, 0.10) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(74, 143, 217, 0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 16,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: '#38BDF8',
                  marginBottom: 10,
                }}
              >
                <ShieldAlert size={13} />
                PHARMAGUARD AI
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  marginBottom: 8,
                }}
              >
                Safety Intelligence &amp; Regulatory Readiness
              </h1>
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  margin: 0,
                  maxWidth: 520,
                }}
              >
                AI-assisted drug safety signal detection and regulatory submission readiness.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
                <span className="system-ready-dot" />
                <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
                  AI Analysis Ready
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 4,
                padding: '14px 18px',
                background: 'rgba(245, 166, 35, 0.06)',
                border: '1px solid rgba(245, 166, 35, 0.18)',
                borderRadius: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#F5A623',
                }}
              >
                <ShieldAlert size={12} />
                DEMO DATA
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'right' }}>
                Fictional data • Demonstration only
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. KPI CARDS ───────────────────────────────────────────────── */}
        <div className="dashboard-kpi-grid">
          <KPICard
            id="kpi-risk-score"
            icon={<ShieldAlert size={15} />}
            label="Safety Risk Score"
            value="78/100"
            status="High Risk"
            statusColor="#EF4444"
            accentColor="#EF4444"
            onClick={() => navigate('/signal-analysis')}
          />
          <KPICard
            id="kpi-signals-detected"
            icon={<AlertTriangle size={15} />}
            label="Signals Detected"
            value={String(totalSignals)}
            status="Requires Review"
            statusColor="#F59E0B"
            accentColor="#F59E0B"
            onClick={() => navigate('/signal-analysis')}
          />
          <KPICard
            id="kpi-validated-signals"
            icon={<CheckCircle size={15} />}
            label="Validated Signals"
            value={String(validatedSignals)}
            status="Validated"
            statusColor="#22C55E"
            accentColor="#22C55E"
            onClick={() => navigate('/signal-analysis')}
          />
          <KPICard
            id="kpi-regulatory-readiness"
            icon={<BarChart3 size={15} />}
            label="Regulatory Readiness"
            value="84%"
            status="Mostly Ready"
            statusColor="#38BDF8"
            accentColor="#38BDF8"
            onClick={() => navigate('/gap-detection')}
          />
          <KPICard
            id="kpi-critical-issues"
            icon={<AlertOctagon size={15} />}
            label="Critical Issues"
            value={String(DEMO_METRICS.criticalIssues)}
            status="Action Required"
            statusColor="#EF4444"
            accentColor="#EF4444"
            onClick={() => navigate('/gap-detection')}
          />
        </div>

        {/* ── 3. RISK DISTRIBUTION + AI ASSESSMENT ───────────────────────── */}
        <div className="dashboard-analysis-row">
          {/* Risk Distribution */}
          <div className="glass-card" style={{ padding: '24px 26px', borderRadius: 18 }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Risk Distribution
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Current safety signal severity
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0, margin: '0 auto' }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={RISK_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {RISK_DISTRIBUTION.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<DonutTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    {totalSignals}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
                    Signals
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 160 }}>
                {RISK_DISTRIBUTION.map(item => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: item.color,
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${item.color}80`,
                        }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 16 }}>
                      {item.value}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: 6,
                    paddingTop: 12,
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Total Signals</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {totalSignals}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Safety Assessment */}
          <div
            className="glass-card"
            style={{
              padding: '24px 26px',
              borderRadius: 18,
              background: 'rgba(239, 68, 68, 0.03)',
              borderColor: 'rgba(239, 68, 68, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                  AI Safety Assessment
                </div>
              </div>

              <div
                style={{
                  padding: '16px 18px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.20)',
                  borderRadius: 12,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: 'var(--text-tertiary)',
                      marginBottom: 4,
                    }}
                  >
                    OVERALL RISK
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444', letterSpacing: '-0.02em' }}>
                    HIGH
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                    78
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>/ 100</div>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
                Multiple safety signals require further review. Eight signals have been validated, while three critical issues require attention before regulatory submission.
              </p>
            </div>

            <div>
              <div
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Zap size={11} style={{ color: '#38BDF8', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  AI-generated assessment · For demonstration only
                </span>
              </div>

              <Button
                id="btn-view-signal-analysis"
                variant="secondary"
                size="sm"
                icon={<TrendingUp size={13} />}
                onClick={() => navigate('/signal-analysis')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                View Signal Analysis <ArrowRight size={13} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── 4. REGULATORY READINESS ─────────────────────────────────────── */}
        <div
          className="glass-card"
          style={{
            padding: '24px 28px',
            borderRadius: 18,
            background: 'rgba(56, 189, 248, 0.03)',
            borderColor: 'rgba(56, 189, 248, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 22,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Regulatory Submission Readiness
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                Overall submission gap assessment
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#38BDF8', lineHeight: 1, letterSpacing: '-0.04em' }}>
                  84%
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#38BDF8',
                      boxShadow: '0 0 6px #38BDF8',
                    }}
                  />
                  <span style={{ fontSize: 12, color: '#38BDF8', fontWeight: 600 }}>
                    Mostly Ready
                  </span>
                </div>
              </div>
              <div
                style={{
                  padding: '10px 16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.20)',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: '#EF4444', lineHeight: 1 }}>3</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
                  Critical Issues
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {READINESS_BARS.map(bar => (
              <div key={bar.label}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 7,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{bar.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {bar.pct}%
                  </span>
                </div>
                <AnimatedBar pct={bar.pct} color={bar.color} />
              </div>
            ))}
          </div>

          <Button
            id="btn-review-submission-gaps"
            variant="secondary"
            size="sm"
            icon={<Target size={13} />}
            onClick={() => navigate('/gap-detection')}
          >
            Review Submission Gaps <ArrowRight size={13} />
          </Button>
        </div>

        {/* ── 5. CRITICAL ISSUES + RECENT ACTIVITY ───────────────────────── */}
        <div className="dashboard-bottom-row">
          {/* Critical Issues */}
          <div className="glass-card" style={{ padding: '22px 24px', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                  flexShrink: 0,
                }}
              >
                <AlertOctagon size={14} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Critical Issues Requiring Attention
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CRITICAL_ITEMS.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(item.route)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 12,
                    transition: 'background 150ms ease, border-color 150ms ease, transform 150ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--glass-bg-hover)';
                    el.style.borderColor = 'var(--glass-border-strong)';
                    el.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.background = 'var(--glass-bg)';
                    el.style.borderColor = 'var(--glass-border)';
                    el.style.transform = '';
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background:
                        item.badgeVariant === 'danger'
                          ? 'rgba(239, 68, 68, 0.10)'
                          : 'rgba(245, 158, 11, 0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.badgeVariant === 'danger' ? '#EF4444' : '#F59E0B',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                  <StatusBadge variant={item.badgeVariant} label={item.badge} />
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card" style={{ padding: '22px 24px', borderRadius: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38BDF8',
                  flexShrink: 0,
                }}
              >
                <Clock size={14} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                Recent Activity
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {RECENT_ACTIVITY.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    paddingBottom: i < RECENT_ACTIVITY.length - 1 ? 16 : 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'var(--glass-bg-hover)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {item.icon}
                    </div>
                    {i < RECENT_ACTIVITY.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          background: 'var(--glass-border)',
                          marginTop: 6,
                          minHeight: 20,
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        marginBottom: 3,
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                      {item.sub}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Clock size={10} />
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
