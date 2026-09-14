import { useState, useRef } from 'react';
import { Upload, Trash2, FileText, CheckCircle, ArrowUp } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import type { BadgeVariant } from '../components/StatusBadge';
import { useDocuments } from '../hooks/useDocuments';
import type { CTDDocument, CTDModule } from '../types/document';
import { formatDateTime } from '../utils/parsers';

const statusVariant: Record<CTDDocument['status'], BadgeVariant> = {
  complete: 'success',
  incomplete: 'warning',
  missing: 'danger',
  'under-review': 'info',
};

const moduleLabels: Record<CTDModule, string> = {
  module1: 'Module 1 (Admin & Prescribing)',
  module2: 'Module 2 (Summaries & Overviews)',
  module3: 'Module 3 (Quality & CMC)',
  module4: 'Module 4 (Nonclinical Reports)',
  module5: 'Module 5 (Clinical Study Reports)',
};

export default function CTDDocuments({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { documents, isUploading, handleUpload, removeDocument, markComplete } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      await handleUpload(Array.from(files));
      triggerToast(`Successfully uploaded ${files.length} document${files.length !== 1 ? 's' : ''}.`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <>
      <Header
        title="CTD Documents"
        subtitle="Upload and evaluate Common Technical Document submission modules."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          documents.length > 0 && (
            <Button
              id="ctd-browse-header-btn"
              variant="primary"
              size="sm"
              icon={<Upload size={13} />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Document
            </Button>
          )
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {toastMessage && (
          <div style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 1000,
            background: 'rgba(16, 26, 46, 0.95)', border: '1px solid var(--accent)',
            borderRadius: 12, padding: '12px 20px', color: 'var(--text-primary)',
            fontSize: 13.5, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', gap: 10, backdropFilter: 'blur(16px)',
          }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            {toastMessage}
          </div>
        )}

        {/* ── LARGE GLASS UPLOAD AREA ───────────────────────────────────── */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          multiple
          style={{ display: 'none' }}
          onChange={e => handleFileSelect(e.target.files)}
        />

        <div
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          style={{
            background: isDragOver ? 'rgba(74, 143, 217, 0.12)' : 'var(--glass-bg)',
            border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--glass-border-strong)'}`,
            borderRadius: 20,
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            backdropFilter: 'blur(20px)',
            position: 'relative',
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {/* Arrow Icon */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(74, 143, 217, 0.15)',
            border: '1px solid rgba(74, 143, 217, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            marginBottom: 16,
          }}>
            <ArrowUp size={24} />
          </div>

          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 6,
            letterSpacing: '-0.01em',
          }}>
            Upload CTD Document
          </h2>

          <p style={{
            fontSize: 13.5,
            color: 'var(--text-secondary)',
            marginBottom: 16,
          }}>
            Drag &amp; drop your document here or
          </p>

          <button
            type="button"
            style={{
              padding: '9px 20px',
              borderRadius: 10,
              background: 'var(--glass-bg-hover)',
              border: '1px solid var(--glass-border-strong)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: 18,
              transition: 'all 150ms ease',
            }}
            onClick={e => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </button>

          <span style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
          }}>
            PDF • DOCX
          </span>

          {isUploading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(7, 16, 31, 0.85)',
              borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                Processing document…
              </span>
            </div>
          )}
        </div>

        {/* ── UPLOADED DOCUMENTS TABLE ─────────────────────────────────── */}
        <div className="glass-card" style={{ borderRadius: 18, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Uploaded Documents
              </span>
              <span style={{
                marginLeft: 10,
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
                background: documents.length > 0 ? 'var(--accent-muted)' : 'var(--glass-bg)',
                color: documents.length > 0 ? 'var(--text-accent)' : 'var(--text-tertiary)',
                border: '1px solid var(--glass-border)',
              }}>
                {documents.length} {documents.length === 1 ? 'file' : 'files'}
              </span>
            </div>
          </div>

          {documents.length === 0 ? (
            <div style={{
              padding: '50px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-tertiary)',
              }}>
                <FileText size={20} />
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-secondary)' }}>
                No documents uploaded yet
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', maxWidth: 320, lineHeight: 1.5 }}>
                Uploaded regulatory documents will be listed here for module compliance verification.
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                    {['Document Name', 'Module', 'Status', 'Upload Date', 'Actions'].map(h => (
                      <th
                        key={h}
                        style={{
                          padding: '11px 18px',
                          textAlign: 'left',
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
                  {documents.map(doc => (
                    <tr
                      key={doc.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.035)', transition: 'background 120ms' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Document Name */}
                      <td style={{ padding: '12px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                          <span>{doc.fileName}</span>
                        </div>
                      </td>

                      {/* Module */}
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {moduleLabels[doc.module] || doc.module}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                        <StatusBadge
                          variant={statusVariant[doc.status]}
                          label={doc.status.replace('-', ' ')}
                          dot
                        />
                      </td>

                      {/* Upload Date */}
                      <td style={{ padding: '12px 18px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {formatDateTime(doc.uploadedAt)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {doc.status !== 'complete' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<CheckCircle size={12} />}
                              onClick={() => markComplete(doc.id)}
                            >
                              Verify
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDocument(doc.id)}
                            title="Delete document"
                          >
                            <Trash2 size={13} style={{ color: 'var(--danger)' }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
