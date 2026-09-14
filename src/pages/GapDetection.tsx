import { useState } from 'react';
import {
  Search, AlertTriangle, CheckCircle, FileText, Upload,
  Binary, FileSpreadsheet, BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { useDocuments } from '../hooks/useDocuments';
import { detectGaps, computeModuleSummaries } from '../services/documents';
import type { CTDModule } from '../types/document';

const moduleColors: Record<CTDModule, string> = {
  module1: 'var(--info)',
  module2: 'var(--accent)',
  module3: 'var(--success)',
  module4: 'var(--warning)',
  module5: 'var(--danger)',
};

export default function GapDetection({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const navigate = useNavigate();
  const { documents } = useDocuments();
  const [selectedModule, setSelectedModule] = useState<CTDModule | 'all'>('all');

  const gaps = detectGaps(documents);
  const summaries = computeModuleSummaries(documents);
  const filteredGaps = selectedModule === 'all' ? gaps : gaps.filter(g => g.module === selectedModule);

  const requiredGapCount = gaps.filter(g => g.required).length;
  const overallProgress = summaries.reduce((acc, m) => acc + m.completionPercentage, 0) / summaries.length;

  return (
    <>
      <Header
        title="Gap Detection"
        subtitle="ICH M4 CTD submission compliance and gap evaluation."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          documents.length > 0 && (
            <Button
              id="gap-upload-btn"
              variant="secondary"
              size="sm"
              icon={<Upload size={13} />}
              onClick={() => navigate('/ctd-documents')}
            >
              Upload More
            </Button>
          )
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── 5-STAGE WORKFLOW ─────────────────────────────────────────── */}
        <div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12,
          }}>
            Gap Detection Pipeline
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {/* Step 1: Document */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(74, 143, 217, 0.15)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <FileText size={18} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Step 01
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Document
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {documents.length > 0 ? `${documents.length} files ingested` : 'No files'}
              </div>
            </div>

            {/* Step 2: Extraction */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(93, 184, 212, 0.15)', color: 'var(--info)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <Binary size={18} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Step 02
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Extraction
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {documents.length > 0 ? 'TOC & Metadata parsed' : 'Awaiting input'}
              </div>
            </div>

            {/* Step 3: Requirement Mapping */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(52, 199, 123, 0.15)', color: 'var(--success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <FileSpreadsheet size={18} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Step 03
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Requirement Mapping
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                ICH M4 specification
              </div>
            </div>

            {/* Step 4: Gap Detection */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(245, 166, 35, 0.15)', color: '#F5A623',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <Search size={18} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Step 04
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Gap Detection
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {documents.length > 0 ? `${gaps.length} missing sections` : 'Pending files'}
              </div>
            </div>

            {/* Step 5: Completeness Score */}
            <div className="workflow-step">
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(74, 143, 217, 0.15)', color: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
                <BarChart3 size={18} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 2 }}>
                Step 05
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                Completeness Score
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {documents.length > 0 ? `${Math.round(overallProgress)}% submission ready` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        {documents.length === 0 ? (
          <GlassCard style={{ padding: '60px 24px', textAlign: 'center', borderRadius: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', color: 'var(--text-tertiary)',
            }}>
              <Search size={24} />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              No documents available
            </h2>
            <p style={{ fontSize: 13.5, color: 'var(--text-tertiary)', maxWidth: 400, margin: '0 auto 20px', lineHeight: 1.5 }}>
              Upload a CTD document to begin submission checking and automated gap detection against ICH standards.
            </p>
            <Button
              id="upload-doc-empty-btn"
              variant="primary"
              icon={<Upload size={14} />}
              onClick={() => navigate('/ctd-documents')}
            >
              Upload Document
            </Button>
          </GlassCard>
        ) : (
          /* When documents exist, display gap details */
          <>
            {/* Progress & Alert Glass Card */}
            <GlassCard className="p-xl" style={{ borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {requiredGapCount === 0 ? (
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(52, 199, 123, 0.15)', color: 'var(--success)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle size={18} />
                    </div>
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(224, 92, 92, 0.15)', color: 'var(--danger)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertTriangle size={18} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {requiredGapCount === 0 ? 'No Critical Gaps Detected' : `${requiredGapCount} Required CTD Sections Missing`}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                      Overall CTD submission completion score: {Math.round(overallProgress)}%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <StatusBadge variant="danger" label={`${requiredGapCount} Required`} dot />
                  <StatusBadge variant="warning" label={`${gaps.length - requiredGapCount} Optional`} dot />
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{
                height: 6, background: 'var(--glass-bg)', borderRadius: 3,
                overflow: 'hidden', marginTop: 16, border: '1px solid var(--glass-border)',
              }}>
                <div style={{
                  height: '100%',
                  width: `${overallProgress}%`,
                  background: overallProgress >= 80 ? 'var(--success)' : overallProgress >= 50 ? 'var(--warning)' : 'var(--danger)',
                  borderRadius: 3,
                  transition: 'width 300ms ease',
                }} />
              </div>
            </GlassCard>

            {/* Module Filter Tabs */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                onClick={() => setSelectedModule('all')}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: selectedModule === 'all' ? 'var(--accent)' : 'var(--glass-bg)',
                  color: selectedModule === 'all' ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                All Modules ({gaps.length})
              </button>
              {summaries.map(m => {
                const count = gaps.filter(g => g.module === m.module).length;
                return (
                  <button
                    key={m.module}
                    onClick={() => setSelectedModule(m.module)}
                    style={{
                      padding: '7px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'inherit',
                      background: selectedModule === m.module ? 'var(--accent)' : 'var(--glass-bg)',
                      color: selectedModule === m.module ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--glass-border)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {m.module.replace('module', 'M')} ({count})
                  </button>
                );
              })}
            </div>

            {/* Gaps List */}
            <div className="glass-card" style={{ borderRadius: 18, overflow: 'hidden' }}>
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--glass-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Detected Deficiencies &amp; Recommendations
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  {filteredGaps.length} items to address
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredGaps.map(gap => (
                  <div
                    key={`${gap.module}-${gap.sectionCode}`}
                    style={{
                      padding: '16px 20px', borderBottom: '1px solid var(--glass-border)',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                          background: 'var(--glass-bg)', color: moduleColors[gap.module],
                          border: '1px solid var(--glass-border)',
                        }}>
                          {gap.module.replace('module', 'M')} · {gap.sectionCode}
                        </span>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {gap.sectionTitle}
                        </span>
                        {gap.required && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-muted)', padding: '1px 6px', borderRadius: 4 }}>
                            REQUIRED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                        Recommendation: {gap.recommendation}
                      </div>
                    </div>
                    <StatusBadge
                      variant={gap.required ? 'danger' : 'warning'}
                      label={gap.required ? 'critical' : 'recommended'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </>
  );
}
