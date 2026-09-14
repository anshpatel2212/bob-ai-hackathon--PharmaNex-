import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Pill, AlertTriangle, Eye, ArrowRight,
  RotateCcw, ShieldAlert, CheckCircle2
} from 'lucide-react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext';
import { DEMO_PATIENT } from '../data/demoData';
import type { AdverseEvent } from '../types/adverseEvent';
import { formatDate } from '../utils/parsers';

// ─── View Modal for Single AE ─────────────────────────────────────────────────

function ViewCaseModal({ event, onClose }: { event: AdverseEvent; onClose: () => void }) {
  const fields: Array<[string, string | number | undefined]> = [
    ['Case ID', event.reportId],
    ['Patient ID', event.patientId || DEMO_PATIENT.patientId],
    ['Product / Drug Name', event.drugName],
    ['Adverse Event', event.eventDescription],
    ['MedDRA Preferred Term', event.meddraTermPreferred || '—'],
    ['Event Date', event.onsetDate ? formatDate(event.onsetDate) : '—'],
    ['Report Date', formatDate(event.reportDate)],
    ['Seriousness', event.seriousness ? 'Serious' : 'Non-serious'],
    ['Outcome', event.outcome],
    ['Severity', event.severity],
    ['Patient Age', `${event.patientAge ?? DEMO_PATIENT.age} years`],
    ['Patient Sex', event.patientSex ?? DEMO_PATIENT.sex],
    ['Country', event.countryOfOccurrence ?? DEMO_PATIENT.country],
    ['Indication', event.indication ?? DEMO_PATIENT.indication],
    ['Dose', event.dose ?? DEMO_PATIENT.dose],
    ['Reporter Type', event.reportType],
    ['Narrative', event.narrativeSummary],
  ];

  return (
    <Modal open onClose={onClose} title={`Case Details — ${event.reportId}`} maxWidth="580px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {fields.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              padding: '9px 0',
              borderBottom: '1px solid var(--glass-border)',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)', width: 170, flexShrink: 0 }}>
              {label}
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'var(--text-primary)',
                fontWeight: 500,
                flex: 1,
                wordBreak: 'break-word',
                textTransform: label === 'Outcome' || label === 'Severity' ? 'capitalize' : 'none',
              }}
            >
              {value || '—'}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Demo Data Component ──────────────────────────────────────────────────────

export default function PatientDetail({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [viewingEvent, setViewingEvent] = useState<AdverseEvent | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter demo events from state
  const demoEvents = state.adverseEvents.filter(
    e => e.isDemo || e.patientId === DEMO_PATIENT.patientId || e.reportId.startsWith('CASE-DEMO')
  );
  const hasDemoData = demoEvents.length > 0;

  function handleClearEverything() {
    dispatch({ type: 'CLEAR_DEMO_DATA' });
    setShowClearConfirm(false);
  }

  function handleLoadDemo() {
    dispatch({ type: 'LOAD_DEMO_DATA' });
  }

  return (
    <>
      <Header
        title="Demo Data"
        subtitle="Fictional Patient DEMO-001"
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {hasDemoData && (
              <Button
                id="view-demo-analysis-top-btn"
                variant="secondary"
                size="sm"
                icon={<ArrowRight size={13} />}
                onClick={() => navigate('/demo-analysis')}
              >
                View Demo Analysis
              </Button>
            )}
            {hasDemoData ? (
              <Button
                id="clear-demo-data-btn"
                variant="danger"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
                title="Remove fictional demo records and return to empty state"
              >
                Clear Demo
              </Button>
            ) : (
              <Button
                id="load-demo-data-btn"
                variant="primary"
                size="sm"
                icon={<RotateCcw size={13} />}
                onClick={handleLoadDemo}
                title="Restore the fictional demo patient dataset"
              >
                Load Demo Patient
              </Button>
            )}
          </div>
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {!hasDemoData ? (
          /* ── When Demo Data is Cleared ────────────────────────────────── */
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--text-tertiary)',
            }}>
              <CheckCircle2 size={26} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Demo data cleared
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.6 }}>
              Your workspace is now empty. Real user data remains untouched. Click below to reload the fictional patient demo.
            </div>
            <Button
              id="restore-demo-btn"
              variant="primary"
              icon={<RotateCcw size={14} />}
              onClick={handleLoadDemo}
            >
              Load Demo Patient (DEMO-001)
            </Button>
          </GlassCard>
        ) : (
          <>
            {/* ── Section 2: Demo Data Hero Glass Card ─────────────────── */}
            <GlassCard className="p-xl" style={{ border: '1px solid rgba(245, 166, 35, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '2px 8px', borderRadius: 6,
                      background: 'rgba(245, 166, 35, 0.2)', border: '1px solid rgba(245, 166, 35, 0.4)',
                      fontSize: 11, fontWeight: 700, color: '#F5A623', letterSpacing: '0.05em',
                    }}>
                      <ShieldAlert size={12} />
                      DEMO DATA
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Fictional Patient</span>
                  </div>

                  <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0', fontFamily: 'monospace' }}>
                    DEMO-001
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight size={13} />}
                    onClick={() => navigate('/demo-analysis')}
                  >
                    View Demo Analysis
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

            {/* ── 2-Column Info Grid ───────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

              {/* Patient Information Card */}
              <GlassCard className="p-xl">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--glass-border)',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                  }}>
                    <User size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Patient Information
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                      Fictional patient profile
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Age', value: `${DEMO_PATIENT.age}` },
                    { label: 'Sex', value: DEMO_PATIENT.sex },
                    { label: 'Country', value: DEMO_PATIENT.country },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--glass-bg)',
                        borderRadius: 8,
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Treatment Information Card */}
              <GlassCard className="p-xl">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 18,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--glass-border)',
                }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--info)',
                  }}>
                    <Pill size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Treatment
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>
                      Drug regimen details
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Drug', value: DEMO_PATIENT.drug, highlight: true },
                    { label: 'Dose', value: DEMO_PATIENT.dose },
                    { label: 'Indication', value: DEMO_PATIENT.indication },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        background: 'var(--glass-bg)',
                        borderRadius: 8,
                        border: '1px solid var(--glass-border)',
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{
                        fontSize: 13.5,
                        fontWeight: 600,
                        color: item.highlight ? 'var(--text-accent)' : 'var(--text-primary)',
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

            </div>

            {/* ── Adverse Events Table ─────────────────────────────────── */}
            <GlassCard>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: 'rgba(224, 92, 92, 0.15)',
                    border: '1px solid rgba(224, 92, 92, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--danger)',
                  }}>
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Adverse Events
                    </span>
                    <span style={{
                      marginLeft: 8,
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(245, 166, 35, 0.15)',
                      color: '#F5A623',
                      border: '1px solid rgba(245, 166, 35, 0.3)',
                    }}>
                      {demoEvents.length} {demoEvents.length === 1 ? 'Record' : 'Records'}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Belonging to patient DEMO-001
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                      {['Case ID', 'Patient ID', 'Drug', 'Adverse Event', 'Seriousness', 'Outcome', 'Actions'].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: '11px 14px',
                            textAlign: h === 'Actions' ? 'right' : h === 'Seriousness' || h === 'Outcome' ? 'center' : 'left',
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
                    {demoEvents.map(ae => (
                      <tr
                        key={ae.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 120ms' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{
                          padding: '12px 14px',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          fontSize: 12.5,
                          whiteSpace: 'nowrap',
                        }}>
                          {ae.reportId}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          color: 'var(--text-secondary)',
                          fontFamily: 'monospace',
                          whiteSpace: 'nowrap',
                        }}>
                          {ae.patientId || DEMO_PATIENT.patientId}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                        }}>
                          {ae.drugName}
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                        }}>
                          {ae.eventDescription}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <StatusBadge
                            variant={ae.seriousness ? 'danger' : 'neutral'}
                            label={ae.seriousness ? 'Serious' : 'Non-serious'}
                            dot
                          />
                        </td>
                        <td style={{
                          padding: '12px 14px',
                          textAlign: 'center',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap',
                          textTransform: 'capitalize',
                        }}>
                          {ae.outcome}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              id={`view-demo-${ae.id}`}
                              onClick={() => setViewingEvent(ae)}
                              title="View case details"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: '1px solid var(--glass-border)',
                                background: 'var(--glass-bg)',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text-secondary)',
                                transition: 'all 120ms ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--glass-bg-hover)';
                                e.currentTarget.style.color = 'var(--text-primary)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--glass-bg)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </>
        )}

      </div>

      {/* ── Case View Modal ────────────────────────────────────────── */}
      {viewingEvent && (
        <ViewCaseModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
        />
      )}

      {/* ── Section 11 & 12: Clear Demo Confirmation Modal ─────────── */}
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
              id="confirm-clear-demo-btn"
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
