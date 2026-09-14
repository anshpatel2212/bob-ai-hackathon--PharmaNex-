import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShieldAlert, BarChart3, PieChart,
  ArrowRight, CheckCircle2, RotateCcw,
  Sparkles, Layers
} from 'lucide-react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext';
import { DEMO_PATIENT } from '../data/demoData';

export default function DemoAnalysis({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Derive demo records strictly from session state
  const demoEvents = state.adverseEvents.filter(
    e => e.isDemo || e.patientId === DEMO_PATIENT.patientId || e.reportId.startsWith('CASE-DEMO')
  );
  const hasDemo = demoEvents.length > 0;

  function handleClearEverything() {
    dispatch({ type: 'CLEAR_DEMO_DATA' });
    setShowClearConfirm(false);
  }

  function handleRestoreDemo() {
    dispatch({ type: 'LOAD_DEMO_DATA' });
  }

  return (
    <>
      <Header
        title="Demo Analysis"
        subtitle="Analysis generated from the fictional DEMO-001 dataset."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/demo-data')}
            >
              View Demo Data
            </Button>
            {hasDemo ? (
              <Button
                id="clear-demo-analysis-top-btn"
                variant="danger"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
              >
                Clear Demo
              </Button>
            ) : (
              <Button
                id="restore-demo-analysis-btn"
                variant="primary"
                size="sm"
                icon={<RotateCcw size={13} />}
                onClick={handleRestoreDemo}
              >
                Restore Demo Data
              </Button>
            )}
          </div>
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Demo Analysis Badge Banner ─────────────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(245, 166, 35, 0.08)',
          border: '1px solid rgba(245, 166, 35, 0.3)',
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(245, 166, 35, 0.2)',
              border: '1px solid rgba(245, 166, 35, 0.45)',
              borderRadius: 6,
              padding: '3px 9px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#F5A623',
            }}>
              <ShieldAlert size={12} />
              DEMO ANALYSIS
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
              Analysis generated from the fictional DEMO-001 dataset.
            </span>
          </div>

          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
            Fictional single-patient demonstration · Not real clinical evidence
          </span>
        </div>

        {!hasDemo ? (
          /* ── Empty State when Demo Data is Cleared ────────────────────── */
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--text-tertiary)',
            }}>
              <CheckCircle2 size={26} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Demo data cleared
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Your workspace is now empty. All fictional demo patient records and demo calculations were removed.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Button
                variant="primary"
                onClick={handleRestoreDemo}
                icon={<RotateCcw size={14} />}
              >
                Restore Demo Data
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/adverse-events')}
              >
                Go to Adverse Events
              </Button>
            </div>
          </GlassCard>
        ) : (
          <>
            {/* ── Section 4: Data Quality Analysis ──────────────────────── */}
            <div>
              <div style={{
                fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>
                Data Quality Analysis
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
                <GlassCard style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Patients</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>1</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Fictional (DEMO-001)</div>
                </GlassCard>

                <GlassCard style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Cases</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>3</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>All linked to DEMO-001</div>
                </GlassCard>

                <GlassCard style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Drugs</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>1</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>DemoDrug-100 (50mg)</div>
                </GlassCard>

                <GlassCard style={{ padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Total Adverse Events</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>3</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Headache, Dizziness, Nausea</div>
                </GlassCard>

                <GlassCard style={{ padding: '16px 18px', border: '1px solid rgba(52, 199, 123, 0.3)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Data Quality</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>100%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Intentionally clean demo data</div>
                </GlassCard>
              </div>
            </div>

            {/* ── Section 5: Safety Signal Analysis Table ────────────────── */}
            <GlassCard>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Safety Signal Analysis
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Statistical disproportionality metrics for DemoDrug-100 events
                  </div>
                </div>

                <div style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'rgba(245, 166, 35, 0.1)', border: '1px solid rgba(245, 166, 35, 0.25)',
                  fontSize: 11.5, color: '#F5A623', fontWeight: 600,
                }}>
                  Insufficient data for reliable statistical signal detection
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                      {['Drug', 'Adverse Event', 'Case Count', 'Serious Cases', 'PRR', 'ROR (95% CI)', 'Confidence Information', 'Review Priority'].map(h => (
                        <th key={h} style={{
                          padding: '11px 16px', textAlign: 'left',
                          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: 'var(--text-tertiary)',
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { event: 'Headache', count: 1, serious: 0 },
                      { event: 'Dizziness', count: 1, serious: 0 },
                      { event: 'Nausea', count: 1, serious: 0 },
                    ].map(row => (
                      <tr key={row.event} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          DemoDrug-100
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {row.event}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                          {row.count}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                          {row.serious}
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                          —
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>
                          —
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-tertiary)' }}>
                          N = 1 patient (Threshold requires N ≥ 3 across cohort)
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11.5, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)',
                            border: '1px solid var(--glass-border)',
                          }}>
                            Insufficient Evidence
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* ── Section 6: Review Priority Card ────────────────────────── */}
            <GlassCard className="p-xl">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <Layers size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Review Priority
                    </h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      Automated assessment of medical reviewer urgency
                    </div>
                  </div>
                </div>

                <StatusBadge variant="neutral" label="Insufficient Evidence" dot />
              </div>

              <div style={{
                padding: '14px 16px', borderRadius: 10,
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--text-primary)' }}>Evaluation Rationale: </strong>
                The demo dataset contains a single fictional patient and is insufficient for drawing reliable safety conclusions.
              </div>
            </GlassCard>

            {/* ── Section 7: AI Analysis Summary ─────────────────────────── */}
            <GlassCard className="p-xl">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(74, 143, 217, 0.15)', border: '1px solid rgba(74, 143, 217, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent)',
                }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Demo Analysis Summary
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    AI-synthesized observational narrative
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: 13.5, color: 'var(--text-primary)', lineHeight: 1.7,
                padding: '16px 18px', borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)',
                marginBottom: 14,
              }}>
                Three adverse-event records associated with DemoDrug-100 were identified for fictional patient DEMO-001. The observed events were headache, dizziness, and nausea. Because the demonstration dataset contains only one patient, it is insufficient to establish a meaningful statistical safety signal or causal relationship.
              </div>

              <div style={{
                fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <ShieldAlert size={14} style={{ color: '#F5A623', flexShrink: 0 }} />
                AI-generated demonstration analysis — not medical or regulatory advice.
              </div>
            </GlassCard>

            {/* ── Section 8: Visual Analysis ─────────────────────────────── */}
            <div>
              <div style={{
                fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
                textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>
                Visual Analysis (Fictional Records Only)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {/* Event Distribution */}
                <GlassCard className="p-lg">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Event Distribution
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { name: 'Headache', count: 1, pct: 33 },
                      { name: 'Dizziness', count: 1, pct: 33 },
                      { name: 'Nausea', count: 1, pct: 33 },
                    ].map(ev => (
                      <div key={ev.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{ev.name}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ev.count}</span>
                        </div>
                        <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ width: `${ev.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Seriousness */}
                <GlassCard className="p-lg">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <PieChart size={16} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Seriousness Classification
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Non-serious</span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>3 (100%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--success)', borderRadius: 3 }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>Serious</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-tertiary)' }}>0 (0%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: '0%', height: '100%', background: 'var(--danger)', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Outcome */}
                <GlassCard className="p-lg">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <TrendingUp size={16} style={{ color: 'var(--info)' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Clinical Outcomes
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Recovered</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>2 (67%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: '67%', height: '100%', background: 'var(--info)', borderRadius: 3 }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Recovering</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>1 (33%)</span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <div style={{ width: '33%', height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* ── Section 9: Demo Analysis Result Card ────────────────────── */}
            <GlassCard className="p-xl" style={{ border: '1px solid var(--accent-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ flex: 1, minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="badge badge--accent" style={{ fontSize: 10.5 }}>DEMO RESULT</span>
                    <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Demo Analysis
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Dataset</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        DEMO-001
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Patients</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>1</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Cases</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>3</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Events</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>3</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Signal</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Insufficient Evidence
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Review Priority</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Insufficient Evidence
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 16 }}>
                    Run analysis on your own data for meaningful results.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'center' }}>
                  <Button
                    id="analyze-my-data-btn"
                    variant="primary"
                    size="md"
                    icon={<ArrowRight size={14} />}
                    onClick={() => navigate('/signal-analysis')}
                  >
                    Analyze My Data
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    Clear Demo
                  </Button>
                </div>
              </div>
            </GlassCard>
          </>
        )}

      </div>

      {/* ── Section 11 & 12: Clear Demo Confirmation Modal ─────────────── */}
      <Modal
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear all demo data and analysis?"
        maxWidth="480px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button
              id="confirm-clear-everything-btn"
              variant="danger"
              onClick={handleClearEverything}
            >
              Clear Everything
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
            This will permanently remove the fictional demo patient, adverse events, and all analysis results generated from the demo dataset.
          </p>

          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6,
          }}>
            <strong>Note: </strong>Real user-uploaded datasets and entered cases are strictly preserved and will never be deleted by this action.
          </div>
        </div>
      </Modal>
    </>
  );
}
