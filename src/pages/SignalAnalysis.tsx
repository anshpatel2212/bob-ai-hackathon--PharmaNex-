import { useState } from 'react';
import {
  TrendingUp, Play, AlertTriangle, CheckCircle, Database,
  FileCheck, Calculator, AlertOctagon, UserCheck,
  ShieldAlert, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import type { BadgeVariant } from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Select } from '../components/Input';
import { useSignals } from '../hooks/useSignals';
import { useAppContext } from '../context/AppContext';
import type { Signal } from '../types/signal';

const priorityVariant: Record<Signal['priority'], BadgeVariant> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

export default function SignalAnalysis({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const { signals, signalRuns, isRunning, error, runAnalysis, updateSignalStatus } = useSignals();
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [newStatus, setNewStatus] = useState<Signal['status']>('under-review');

  const events = state.adverseEvents;
  const hasEvents = events.length > 0;
  const lastRun = signalRuns[signalRuns.length - 1];

  // Workflow statistics
  const totalCases = events.length;
  const uniqueDrugs = new Set(events.map(e => e.drugName.trim().toLowerCase())).size;
  const completedCases = events.filter(e => e.drugName && e.eventDescription && e.reportDate).length;
  const qualityScore = totalCases > 0 ? Math.round((completedCases / totalCases) * 100) : 0;
  const seriousCount = events.filter(e => e.seriousness).length;

  return (
    <>
      <Header
        title="Safety Signal Analysis"
        subtitle="AI-assisted disproportionality evaluation and safety signal detection."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <Button
            id="run-analysis-btn"
            variant="primary"
            icon={isRunning ? undefined : <Play size={13} />}
            loading={isRunning}
            disabled={!hasEvents}
            onClick={runAnalysis}
          >
            {isRunning ? 'Analyzing…' : 'Run Safety Analysis'}
          </Button>
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Regulatory Disclaimer Banner ───────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(74, 143, 217, 0.08)',
          border: '1px solid rgba(74, 143, 217, 0.25)',
          borderRadius: 14,
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(74, 143, 217, 0.2)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={15} />
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                AI-assisted analysis — requires qualified human review.
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginLeft: 8 }}>
                Statistical disproportionality indicates an association, never confirmed clinical causality.
              </span>
            </div>
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
            ICH E2E Pharmacovigilance
          </span>
        </div>

        {/* ── 5-STAGE ANALYSIS WORKFLOW ──────────────────────────────────── */}
        <div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12,
          }}>
            Analysis Workflow
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
            position: 'relative',
          }}>
            {/* Stage 1: Dataset */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(74, 143, 217, 0.15)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <Database size={18} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Stage 01
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Dataset
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {totalCases > 0 ? `${totalCases} cases · ${uniqueDrugs} drug${uniqueDrugs !== 1 ? 's' : ''}` : 'No data loaded'}
              </div>
            </div>

            {/* Stage 2: Data Quality */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(52, 199, 123, 0.15)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <FileCheck size={18} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Stage 02
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Data Quality
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {totalCases > 0 ? `${qualityScore}% valid · ${seriousCount} serious` : 'Validation pending'}
              </div>
            </div>

            {/* Stage 3: Statistical Analysis */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(93, 184, 212, 0.15)', color: 'var(--info)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <Calculator size={18} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Stage 03
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Statistical Analysis
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                PRR &amp; ROR Algorithms
              </div>
            </div>

            {/* Stage 4: Potential Signals */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(245, 166, 35, 0.15)', color: '#F5A623',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <AlertOctagon size={18} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Stage 04
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Potential Signals
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {signals.length > 0 ? `${signals.length} signal${signals.length !== 1 ? 's' : ''} detected` : '0 threshold alerts'}
              </div>
            </div>

            {/* Stage 5: Human Review */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(224, 92, 92, 0.15)', color: 'var(--danger)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <UserCheck size={18} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Stage 05
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Human Review
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Medical adjudication
              </div>
            </div>
          </div>
        </div>

        {/* ── Error message if analysis failed ───────────────────────────── */}
        {error && (
          <div className="alert alert--error">
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* ── Signals Table / Empty State ────────────────────────────────── */}
        {!hasEvents ? (
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--text-tertiary)',
            }}>
              <TrendingUp size={24} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No adverse-event data available
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Upload an adverse event dataset or create manual cases to run statistical disproportionality analysis.
            </div>
            <Button variant="primary" onClick={() => navigate('/adverse-events')}>
              Go to Adverse Events
            </Button>
          </GlassCard>
        ) : signals.length === 0 ? (
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--text-tertiary)',
            }}>
              <CheckCircle size={24} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              No potential safety signals calculated
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
              The current dataset ({totalCases} case reports) has not generated statistical signals meeting the disproportionality threshold (ROR &ge; 2.0, N &ge; 3, p &lt; 0.05).
            </div>
            <Button
              id="run-analysis-empty-btn"
              variant="primary"
              icon={<Play size={13} />}
              loading={isRunning}
              onClick={runAnalysis}
            >
              Run Analysis
            </Button>
          </GlassCard>
        ) : (
          <GlassCard>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--glass-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detected Safety Signals
                </span>
                <span style={{
                  marginLeft: 10, fontSize: 12, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 10,
                  background: 'var(--danger-muted)', color: 'var(--danger)',
                  border: '1px solid rgba(224, 92, 92, 0.3)',
                }}>
                  {signals.length} Signals
                </span>
              </div>

              {lastRun && (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Last run: {new Date(lastRun.runAt).toLocaleTimeString()} · {lastRun.eventsAnalyzed} events evaluated
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                    {[
                      'Drug',
                      'Event',
                      'PRR',
                      'ROR',
                      'Case Count',
                      'Serious Cases',
                      'Trend',
                      'Review Priority',
                      'Actions',
                    ].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '11px 16px',
                          textAlign: h === 'PRR' || h === 'ROR' || h === 'Case Count' || h === 'Serious Cases' ? 'right' : 'left',
                          fontSize: 11,
                          fontWeight: 600,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signals.map(sig => {
                    const prr = sig.proportionalReportingRatio ?? sig.reportingOddsRatio;
                    const trend = sig.trend ?? 'Emerging';
                    return (
                      <tr
                        key={sig.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 120ms' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {sig.drugName}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {sig.eventTerm}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}>
                          {prr.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-accent)' }}>
                          {sig.reportingOddsRatio.toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                          {sig.caseCount}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--danger)' }}>
                          {sig.seriousCount ?? 0}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 6,
                            background: 'var(--glass-bg)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)',
                          }}>
                            {trend}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <StatusBadge variant={priorityVariant[sig.priority]} label={sig.priority} dot />
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSignal(sig);
                              setNewStatus(sig.status);
                            }}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

      </div>

      {/* ── Review Signal Modal ────────────────────────────────────────── */}
      {selectedSignal && (
        <Modal
          open
          onClose={() => setSelectedSignal(null)}
          title={`Signal Review: ${selectedSignal.drugName} — ${selectedSignal.eventTerm}`}
          maxWidth="560px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedSignal(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  updateSignalStatus(selectedSignal.id, newStatus);
                  setSelectedSignal(null);
                }}
              >
                Save Review
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'var(--glass-bg)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Reporting Odds Ratio</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-accent)', fontFamily: 'monospace' }}>
                  {selectedSignal.reportingOddsRatio.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--glass-bg)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>95% Confidence Interval</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace', marginTop: 3 }}>
                  {selectedSignal.ror95CiLower.toFixed(2)} – {selectedSignal.ror95CiUpper.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--glass-bg)', borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Cases Observed</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {selectedSignal.caseCount}
                </div>
              </div>
            </div>

            <div className="alert alert--info" style={{ fontSize: 12.5 }}>
              <Info size={14} style={{ flexShrink: 0 }} />
              Statistical disproportionality indicates an association, never confirmed clinical causality.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Adjudication Status
              </label>
              <Select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as Signal['status'])}
                options={[
                  { value: 'new', label: 'New (Unreviewed)' },
                  { value: 'under-review', label: 'Under Review' },
                  { value: 'validated', label: 'Validated Signal' },
                  { value: 'closed', label: 'Closed (No action)' },
                  { value: 'false-positive', label: 'False Positive' },
                ]}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
