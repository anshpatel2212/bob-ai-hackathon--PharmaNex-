import { useState } from 'react';
import {
  FileText, Plus, Download, Trash2, Clock, Sparkles, CheckCircle2,
  AlertTriangle, ShieldAlert, ArrowLeft, Check, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import type { BadgeVariant } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Input';
import { useAppContext } from '../context/AppContext';
import { generateReport, exportReportAsText } from '../services/reports';
import type { Report, ReportGenerationRequest } from '../types/report';
import { formatDateTime } from '../utils/parsers';

const statusVariant: Record<Report['status'], BadgeVariant> = {
  draft: 'warning', final: 'success', archived: 'neutral',
};

const categoryLabels: Record<Report['category'], string> = {
  safety: 'Safety Report', submission: 'Submission Report',
  signal: 'Signal Report', 'gap-analysis': 'Gap Analysis', combined: 'Combined Report',
};

const sectionIcons: Record<string, React.ReactNode> = {
  '1. Executive Summary': <FileText size={16} style={{ color: 'var(--accent)' }} />,
  '2. Safety Signals': <ShieldAlert size={16} style={{ color: 'var(--warning)' }} />,
  '3. Statistical Evidence': <Layers size={16} style={{ color: 'var(--info)' }} />,
  '4. Regulatory Gaps': <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />,
  '5. Submission Readiness': <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />,
  '6. Recommendations': <Sparkles size={16} style={{ color: 'var(--accent)' }} />,
  '7. Human Review Notes': <Check size={16} style={{ color: 'var(--text-secondary)' }} />,
};

export default function Reports({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [form, setForm] = useState<ReportGenerationRequest>({
    title: '',
    category: 'combined',
    includeAdverseEvents: true,
    includeSignals: true,
    includeDocuments: true,
    includeGapAnalysis: true,
    notes: '',
  });

  const selectedReport = state.reports.find(r => r.id === selectedReportId) ?? null;
  const hasAnyData = state.adverseEvents.length > 0 || state.signals.length > 0 || state.documents.length > 0;

  async function handleGenerate() {
    if (!form.title.trim()) return;
    setIsGenerating(true);
    try {
      const report = await generateReport(
        form, state.adverseEvents, state.signals, state.documents, state.userName
      );
      dispatch({ type: 'ADD_REPORT', payload: report });
      setSelectedReportId(report.id);
      setShowCreate(false);
      setForm({ title: '', category: 'combined', includeAdverseEvents: true, includeSignals: true, includeDocuments: true, includeGapAnalysis: true, notes: '' });
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownload(report: Report) {
    const text = exportReportAsText(report);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_REPORT', payload: id });
    if (selectedReportId === id) setSelectedReportId(null);
  }

  function handleFinalise(report: Report) {
    dispatch({ type: 'UPDATE_REPORT', payload: { ...report, status: 'final', updatedAt: new Date().toISOString() } });
  }

  return (
    <>
      <Header
        title="AI Reports"
        subtitle="Review generated safety evaluation and regulatory submission reports."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div className="flex gap-sm">
            {selectedReport && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowLeft size={13} />}
                onClick={() => setSelectedReportId(null)}
              >
                All Reports
              </Button>
            )}
            <Button
              id="create-report-btn"
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              disabled={!hasAnyData}
              data-tooltip={!hasAnyData ? 'Upload adverse events or CTD documents first' : undefined}
              onClick={() => {
                setForm(f => ({
                  ...f,
                  title: `AI Safety & Submission Report — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                }));
                setShowCreate(true);
              }}
            >
              Generate AI Report
            </Button>
          </div>
        }
      />

      <div className="app-content fade-in">
        {state.reports.length === 0 ? (
          <GlassCard className="p-xl">
            <EmptyState
              icon={<Sparkles size={28} />}
              title="No report generated yet."
              description="Complete an analysis to generate an AI-assisted report."
              action={{
                label: 'Start Analysis',
                onClick: () => navigate('/signal-analysis'),
              }}
            />
          </GlassCard>
        ) : selectedReport ? (
          /* Detailed 7-Section Report View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Report Header Card */}
            <GlassCard className="p-lg">
              <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    onClick={() => setSelectedReportId(null)}
                    className="flex items-center justify-center"
                    style={{
                      width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)', cursor: 'pointer',
                    }}
                    title="Back to Reports"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <div className="flex items-center gap-sm">
                      <h2 className="text-primary font-bold" style={{ fontSize: 18, margin: 0 }}>
                        {selectedReport.title}
                      </h2>
                      <span className="badge badge--accent" style={{ fontSize: 10 }}>
                        <Sparkles size={10} style={{ marginRight: 4 }} />
                        AI-Assisted
                      </span>
                    </div>
                    <div className="text-secondary text-sm" style={{ marginTop: 4 }}>
                      {categoryLabels[selectedReport.category]} · Generated by {selectedReport.generatedBy} on {formatDateTime(selectedReport.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-sm" style={{ flexWrap: 'wrap' }}>
                  <StatusBadge variant={statusVariant[selectedReport.status]} label={selectedReport.status} />
                  {selectedReport.status === 'draft' && (
                    <Button variant="success" size="sm" onClick={() => handleFinalise(selectedReport)}>
                      Finalise Report
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" icon={<Download size={13} />} onClick={() => handleDownload(selectedReport)}>
                    Export
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(selectedReport.id)} aria-label="Delete report">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>

              <div style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)',
                fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6,
              }}>
                <span className="text-primary font-semibold">Regulatory Notice: </span>
                AI-assisted analysis — requires qualified human medical review in accordance with ICH E2B(R3) and regional health authority guidelines.
              </div>
            </GlassCard>

            {/* 7 Standardized Glass Report View Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {selectedReport.sections
                .sort((a, b) => a.order - b.order)
                .map(section => (
                  <GlassCard key={section.id} className="p-lg">
                    <div className="flex items-center gap-sm mb-md">
                      {sectionIcons[section.title] ?? <FileText size={16} style={{ color: 'var(--accent)' }} />}
                      <h3 className="section-title" style={{ margin: 0 }}>
                        {section.title}
                      </h3>
                    </div>
                    <div style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      padding: 'var(--space-md)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--glass-border)',
                      fontFamily: section.title.includes('Statistical') || section.title.includes('Review Notes') ? 'var(--font-mono, monospace)' : 'inherit',
                    }}>
                      {section.content}
                    </div>
                  </GlassCard>
                ))}
            </div>
          </div>
        ) : (
          /* Report List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="flex justify-between items-center mb-sm">
              <span className="text-secondary text-sm">
                Showing {state.reports.length} generated report{state.reports.length !== 1 ? 's' : ''}
              </span>
            </div>

            {state.reports.map(report => (
              <GlassCard
                key={report.id}
                className="p-lg"
                interactive
                onClick={() => setSelectedReportId(report.id)}
              >
                <div className="flex items-center gap-lg" style={{ flexWrap: 'wrap' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                    background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={20} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-sm">
                      <span className="text-primary font-semibold truncate">{report.title}</span>
                      <span className="badge badge--accent" style={{ fontSize: 10 }}>AI Report</span>
                    </div>
                    <div className="flex gap-sm mt-sm" style={{ flexWrap: 'wrap', gap: 6 }}>
                      <span className="text-secondary text-sm">{categoryLabels[report.category]}</span>
                      <span className="text-tertiary text-sm">·</span>
                      <span className="text-secondary text-sm">{report.generatedBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm" style={{ flexShrink: 0, flexWrap: 'wrap', gap: 8 }}>
                    <StatusBadge variant={statusVariant[report.status]} label={report.status} />
                    <div className="flex items-center gap-sm text-tertiary text-sm">
                      <Clock size={12} />
                      {formatDateTime(report.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-sm" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(report)} aria-label="Download report">
                      <Download size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)} aria-label="Delete report">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="text-secondary text-sm" style={{ marginTop: 10, paddingLeft: 60 }}>
                  {report.summary}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Generate AI-Assisted Report"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button
              id="generate-report-submit"
              variant="primary"
              loading={isGenerating}
              disabled={!form.title.trim()}
              onClick={handleGenerate}
            >
              Generate Report
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Input
            id="report-title"
            label="Report Title"
            placeholder="e.g. Q3 2024 Safety Evaluation"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />

          <Select
            id="report-category"
            label="Report Type"
            options={[
              { value: 'combined', label: 'Safety & Submission Combined Report' },
              { value: 'safety', label: 'Adverse Event Safety Report' },
              { value: 'signal', label: 'Signal Disproportionality Report' },
              { value: 'submission', label: 'CTD Submission Readiness Report' },
              { value: 'gap-analysis', label: 'Regulatory Gap Analysis' },
            ]}
            value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value as typeof form.category }))}
          />

          <div style={{
            padding: '12px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          }}>
            <div className="text-primary text-sm font-semibold" style={{ marginBottom: 6 }}>
              Standard 7-Card Report Structure Included:
            </div>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li>Executive Summary</li>
              <li>Safety Signals</li>
              <li>Statistical Evidence</li>
              <li>Regulatory Gaps</li>
              <li>Submission Readiness</li>
              <li>Recommendations</li>
              <li>Human Review Notes</li>
            </ol>
          </div>

          <Textarea
            id="report-notes"
            label="Medical Reviewer Notes / Scope (optional)"
            placeholder="Enter clinical reviewer observations or specific context..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
        </div>
      </Modal>
    </>
  );
}
