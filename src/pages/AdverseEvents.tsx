import { useState, useMemo, useRef } from 'react';
import {
  Upload, Trash2, Search, AlertCircle, Plus,
  Eye, Pencil, X, CheckCircle, ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import FileUpload from '../components/FileUpload';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { useAdverseEvents } from '../hooks/useAdverseEvents';
import type { AdverseEvent, OutcomeType, ReportType } from '../types/adverseEvent';
import { formatDate, generateId } from '../utils/parsers';
import { useAppContext } from '../context/AppContext';

// ─── Constants & Options ────────────────────────────────────────────────────────

const REPORTER_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'spontaneous', label: 'Spontaneous' },
  { value: 'healthcare-professional', label: 'Healthcare Professional' },
  { value: 'consumer', label: 'Patient / Consumer' },
  { value: 'clinical-trial', label: 'Clinical Trial' },
  { value: 'literature', label: 'Literature' },
  { value: 'regulatory', label: 'Regulatory Authority' },
  { value: 'other', label: 'Other' },
];

const OUTCOME_OPTIONS: Array<{ value: OutcomeType; label: string }> = [
  { value: 'recovered', label: 'Recovered' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'not-recovered', label: 'Not Recovered' },
  { value: 'fatal', label: 'Fatal' },
  { value: 'unknown', label: 'Unknown' },
];

const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
  'Canada', 'Australia', 'Switzerland', 'Spain', 'Italy', 'Netherlands',
  'Sweden', 'India', 'China', 'Brazil', 'Mexico', 'Other',
];


// ─── Form Interface & State ───────────────────────────────────────────────────

interface AEFormData {
  reportId: string;
  patientId: string;
  drugName: string;
  eventDescription: string;
  onsetDate: string;
  reportDate: string;
  seriousness: string; // 'yes' | 'no' | ''
  outcome: string;     // OutcomeType | ''
  patientAge: string;
  patientSex: string;
  countryOfOccurrence: string;
  indication: string;
  dose: string;
  reportType: string;
  meddraTermPreferred: string;
}

function generateCaseId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CASE-${new Date().getFullYear()}-${rand}`;
}

const initialForm = (): AEFormData => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    reportId: generateCaseId(),
    patientId: '',
    drugName: '',
    eventDescription: '',
    onsetDate: today,
    reportDate: today,
    seriousness: 'no',
    outcome: 'recovered',
    patientAge: '',
    patientSex: '',
    countryOfOccurrence: '',
    indication: '',
    dose: '',
    reportType: 'spontaneous',
    meddraTermPreferred: '',
  };
};

type FormErrors = Partial<Record<keyof AEFormData, string>>;

// ─── Validation Logic ─────────────────────────────────────────────────────────

function validateAdverseEvent(form: AEFormData, existingEvents: AdverseEvent[], editId?: string | null): FormErrors {
  const errors: FormErrors = {};
  const today = new Date().toISOString().slice(0, 10);

  // 1. Case ID (Required, trimmed, duplicate check)
  const trimmedId = form.reportId.trim();
  if (!trimmedId) {
    errors.reportId = 'Case ID is required.';
  } else {
    const isDuplicate = existingEvents.some(
      e => e.reportId.trim().toLowerCase() === trimmedId.toLowerCase() && e.id !== editId
    );
    if (isDuplicate) {
      errors.reportId = 'This Case ID already exists in the dataset.';
    }
  }

  // 2. Product / Drug Name (Required)
  if (!form.drugName.trim()) {
    errors.drugName = 'Product / drug name is required.';
  }

  // 3. Adverse Event (Required)
  if (!form.eventDescription.trim()) {
    errors.eventDescription = 'Adverse event description is required.';
  }

  // 4. Event Date (Optional, but if entered validate format and not future)
  if (form.onsetDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.onsetDate)) {
      errors.onsetDate = 'Invalid date format (use YYYY-MM-DD).';
    } else if (form.onsetDate > today) {
      errors.onsetDate = 'Event date cannot be in the future.';
    }
  }

  // 5. Report Date (Optional, defaults to today)
  if (form.reportDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.reportDate)) {
      errors.reportDate = 'Invalid date format (use YYYY-MM-DD).';
    } else if (form.reportDate > today) {
      errors.reportDate = 'Report date cannot be in the future.';
    }
  }

  // Cross-date validation
  if (form.onsetDate && form.reportDate && form.onsetDate > form.reportDate) {
    errors.onsetDate = 'Event date cannot be after report date.';
  }

  // 6. Patient Age (Optional, numeric, valid range 0 - 130)
  if (form.patientAge.trim()) {
    const ageNum = Number(form.patientAge.trim());
    if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 130) {
      errors.patientAge = 'Age must be a whole number between 0 and 130.';
    }
  }

  return errors;
}

// ─── UI Field Component with Beside Error Display ─────────────────────────────

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

function FormField({ label, required, error, children, hint }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 8,
        minHeight: 20,
      }}>
        <label style={{
          fontSize: 12.5,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          userSelect: 'none',
        }}>
          {label}
          {required ? (
            <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 13 }} title="Required field">*</span>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
          )}
        </label>
        {/* Error message directly beside the relevant field */}
        {error && (
          <span
            style={{
              fontSize: 11.5,
              color: 'var(--danger)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontWeight: 500,
              animation: 'fadeIn 150ms ease',
              textAlign: 'right',
            }}
          >
            <AlertCircle size={12} style={{ flexShrink: 0 }} />
            {error}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: -2 }}>
          {hint}
        </span>
      )}
    </div>
  );
}

// ─── Input Components ─────────────────────────────────────────────────────────

function GlassInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  hasError,
}: {
  id?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '9px 13px',
        fontSize: 13.5,
        fontFamily: 'inherit',
        color: 'var(--text-primary)',
        background: hasError ? 'rgba(224,92,92,0.06)' : 'var(--glass-bg)',
        border: `1px solid ${hasError ? 'var(--danger)' : 'var(--glass-border)'}`,
        borderRadius: 8,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 150ms ease, box-shadow 150ms ease, background 150ms ease',
        boxShadow: hasError ? '0 0 0 2px rgba(224,92,92,0.15)' : 'none',
      }}
      onFocus={e => {
        if (!hasError) {
          e.target.style.borderColor = 'var(--accent-border)';
          e.target.style.boxShadow = '0 0 0 3px rgba(74,143,217,0.15)';
        }
      }}
      onBlur={e => {
        if (!hasError) {
          e.target.style.borderColor = 'var(--glass-border)';
          e.target.style.boxShadow = 'none';
        }
      }}
    />
  );
}

function GlassSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  hasError,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  hasError?: boolean;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '9px 32px 9px 13px',
        fontSize: 13.5,
        fontFamily: 'inherit',
        color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
        background: hasError ? 'rgba(224,92,92,0.06)' : 'var(--glass-bg)',
        border: `1px solid ${hasError ? 'var(--danger)' : 'var(--glass-border)'}`,
        borderRadius: 8,
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
        boxSizing: 'border-box',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: hasError ? '0 0 0 2px rgba(224,92,92,0.15)' : 'none',
      }}
      onFocus={e => {
        if (!hasError) {
          e.target.style.borderColor = 'var(--accent-border)';
          e.target.style.boxShadow = '0 0 0 3px rgba(74,143,217,0.15)';
        }
      }}
      onBlur={e => {
        if (!hasError) {
          e.target.style.borderColor = 'var(--glass-border)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value} style={{ background: '#0b1526', color: 'var(--text-primary)' }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── Success Toast ─────────────────────────────────────────────────────────────

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 18px',
        borderRadius: 12,
        background: 'rgba(11,21,38,0.95)',
        border: '1px solid rgba(52,199,123,0.4)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        animation: 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: 380,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          background: 'rgba(52,199,123,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(52,199,123,0.3)',
        }}
      >
        <CheckCircle size={16} style={{ color: 'var(--success)' }} />
      </div>
      <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          padding: 2,
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── View Detail Modal ─────────────────────────────────────────────────────────

function ViewCaseModal({ event, onClose }: { event: AdverseEvent; onClose: () => void }) {
  const fields: Array<[string, string | number | undefined]> = [
    ['Case ID', event.reportId],
    ['Patient ID', event.patientId || '—'],
    ['Dataset Type', event.isDemo ? 'Demo Data (Fictional Patient DEMO-001)' : 'User Data'],
    ['Product / Drug Name', event.drugName],
    ['Adverse Event', event.eventDescription],
    ['MedDRA Preferred Term', event.meddraTermPreferred || '—'],
    ['Event Date', event.onsetDate ? formatDate(event.onsetDate) : '—'],
    ['Report Date', formatDate(event.reportDate)],
    ['Seriousness', event.seriousness ? 'Serious' : 'Non-serious'],
    ['Outcome', event.outcome],
    ['Patient Age', event.patientAge !== undefined ? `${event.patientAge} years` : '—'],
    ['Patient Sex', event.patientSex ? event.patientSex.charAt(0).toUpperCase() + event.patientSex.slice(1) : '—'],
    ['Country', event.countryOfOccurrence || '—'],
    ['Indication', event.indication || '—'],
    ['Dose', event.dose || '—'],
    ['Reporter Type', event.reportType],
    ['Status', event.status ?? 'new'],
  ];

  return (
    <Modal open onClose={onClose} title={`Case Details — ${event.reportId}`} maxWidth="580px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {fields.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              padding: '10px 0',
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
                color: label === 'Dataset Type' && event.isDemo ? '#F5A623' : 'var(--text-primary)',
                fontWeight: 500,
                flex: 1,
                wordBreak: 'break-word',
                textTransform: label === 'Outcome' || label === 'Status' ? 'capitalize' : 'none',
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  event,
  onCancel,
  onConfirm,
}: {
  event: AdverseEvent;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open
      onClose={onCancel}
      title="Delete Adverse Event"
      maxWidth="480px"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button id="confirm-delete-ae-btn" variant="danger" onClick={onConfirm}>
            Delete Case
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
          Are you sure you want to delete this adverse event record? This action cannot be undone.
        </p>

        <div
          style={{
            padding: '12px 16px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5, fontFamily: 'monospace' }}>
            {event.reportId}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <strong>{event.drugName}</strong> · {event.eventDescription}
          </div>
        </div>

        <div
          style={{
            padding: '10px 14px',
            background: 'var(--danger-muted)',
            border: '1px solid rgba(224,92,92,0.3)',
            borderRadius: 8,
            fontSize: 12.5,
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          This record will be permanently removed from your dataset.
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdverseEvents({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) {
  const { dispatch } = useAppContext();
  const {
    events,
    handleUpload,
    isUploading,
    uploadError,
    clearAll,
  } = useAdverseEvents();

  // Form state
  const [formData, setFormData] = useState<AEFormData>(() => initialForm());
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editId, setEditId] = useState<string | null>(null);

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<AdverseEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<AdverseEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [datasetFilter, setDatasetFilter] = useState<'all' | 'user' | 'demo'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const formCardRef = useRef<HTMLDivElement>(null);

  const hasDemo = events.some(e => e.isDemo);
  const userEvents = events.filter(e => !e.isDemo);
  const demoEvents = events.filter(e => e.isDemo);

  // Filtered records for the data table
  const filteredEvents = useMemo(() => {
    let source = events;
    if (datasetFilter === 'user') source = userEvents;
    else if (datasetFilter === 'demo') source = demoEvents;

    if (!searchQuery.trim()) return source;
    const q = searchQuery.trim().toLowerCase();
    return source.filter(e =>
      e.reportId.toLowerCase().includes(q) ||
      e.drugName.toLowerCase().includes(q) ||
      e.eventDescription.toLowerCase().includes(q) ||
      (e.patientId?.toLowerCase().includes(q) ?? false) ||
      (e.meddraTermPreferred?.toLowerCase().includes(q) ?? false) ||
      (e.countryOfOccurrence?.toLowerCase().includes(q) ?? false)
    );
  }, [events, userEvents, demoEvents, datasetFilter, searchQuery]);

  // Field change handler with error clearance
  function updateField<K extends keyof AEFormData>(key: K, value: AEFormData[K]) {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  // Handle Save Case / Save & Add Another
  function handleSave(andAddAnother: boolean) {
    const validationErrors = validateAdverseEvent(formData, events, editId);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const now = new Date().toISOString();
    const isEdit = !!editId;
    const reportId = formData.reportId.trim() || generateCaseId();
    const reportDate = formData.reportDate || now.slice(0, 10);
    const onsetDate = formData.onsetDate || reportDate;
    const outcome = (formData.outcome || 'recovered') as OutcomeType;

    const aeRecord: AdverseEvent = {
      id: editId ?? generateId(),
      reportId,
      patientId: formData.patientId.trim() || undefined,
      drugName: formData.drugName.trim(),
      eventDescription: formData.eventDescription.trim(),
      onsetDate,
      reportDate,
      seriousness: formData.seriousness === 'yes',
      outcome,
      severity: formData.seriousness === 'yes' ? 'severe' : 'moderate',
      causality: 'possible',
      reportType: (formData.reportType || 'spontaneous') as ReportType,
      patientAge: formData.patientAge.trim() ? Number(formData.patientAge.trim()) : undefined,
      patientSex: (formData.patientSex || 'unknown') as AdverseEvent['patientSex'],
      countryOfOccurrence: formData.countryOfOccurrence || undefined,
      indication: formData.indication.trim() || undefined,
      dose: formData.dose.trim() || undefined,
      meddraTermPreferred: formData.meddraTermPreferred.trim() || formData.eventDescription.trim(),
      status: 'new',
      entryMethod: 'manual',
      isDemo: false, // User saved entries are always User Data, never demo!
      uploadedAt: isEdit
        ? (events.find(e => e.id === editId)?.uploadedAt ?? now)
        : now,
    };

    if (isEdit) {
      dispatch({ type: 'UPDATE_ADVERSE_EVENT', payload: aeRecord });
      triggerToast('Adverse event updated successfully.');
      setEditId(null);
    } else {
      dispatch({
        type: 'ADD_ADVERSE_EVENTS',
        payload: {
          events: [aeRecord],
          upload: {
            fileName: 'Manual Entry',
            fileSize: 0,
            recordCount: 1,
            uploadedAt: now,
            validRecords: 1,
            invalidRecords: 0,
            errors: [],
          },
        },
      });
      triggerToast('Adverse event saved successfully.');
    }

    setDatasetFilter('all');
    setFormErrors({});

    if (andAddAnother) {
      setFormData(initialForm());
      setEditId(null);
      const drugInput = document.getElementById('field-drug-name');
      if (drugInput) drugInput.focus();
    } else {
      setFormData(initialForm());
      setEditId(null);
    }
  }

  function handleCancel() {
    setFormData(initialForm());
    setFormErrors({});
    setEditId(null);
  }

  function startEdit(event: AdverseEvent) {
    setFormData({
      reportId: event.reportId,
      patientId: event.patientId ?? '',
      drugName: event.drugName,
      eventDescription: event.eventDescription,
      onsetDate: event.onsetDate ?? '',
      reportDate: event.reportDate,
      seriousness: event.seriousness ? 'yes' : 'no',
      outcome: event.outcome ?? '',
      patientAge: event.patientAge !== undefined ? String(event.patientAge) : '',
      patientSex: event.patientSex ?? '',
      countryOfOccurrence: event.countryOfOccurrence ?? '',
      indication: event.indication ?? '',
      dose: event.dose ?? '',
      reportType: event.reportType ?? '',
      meddraTermPreferred: event.meddraTermPreferred ?? '',
    });
    setEditId(event.id);
    setFormErrors({});

    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function confirmDelete() {
    if (deletingEvent) {
      dispatch({ type: 'DELETE_ADVERSE_EVENT', payload: deletingEvent.id });
      setDeletingEvent(null);
      triggerToast('Record deleted successfully.');
    }
  }

  return (
    <>
      <Header
        title="Adverse Events"
        subtitle="Review and manage safety event records."
        onMobileMenuOpen={onMobileMenuOpen}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button
              id="add-event-top-btn"
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => {
                setEditId(null);
                setFormData(initialForm());
                setFormErrors({});
                formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const el = document.getElementById('field-drug-name');
                if (el) el.focus();
              }}
            >
              + Add Event
            </Button>

            <Button
              id="import-dataset-btn"
              variant="secondary"
              size="sm"
              icon={<Upload size={13} />}
              onClick={() => setShowUploadModal(v => !v)}
            >
              Upload Dataset
            </Button>

            {hasDemo && (
              <Button
                id="header-clear-demo-btn"
                variant="danger"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={() => dispatch({ type: 'CLEAR_DEMO_DATA' })}
                title="Remove fictional demo records"
              >
                Clear Demo Data
              </Button>
            )}

            {events.length > 0 && (
              <Button
                id="clear-all-ae-btn"
                variant="ghost"
                size="sm"
                icon={<Trash2 size={13} />}
                onClick={clearAll}
                title="Clear all adverse events from session"
              >
                Clear All
              </Button>
            )}
          </div>
        }
      />

      <div className="app-content fade-in" style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Demo Notice Banner if Demo Data is Active ─────────────────── */}
        {hasDemo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            padding: '10px 16px',
            background: 'rgba(245, 166, 35, 0.08)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: 10,
            backdropFilter: 'blur(16px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '2px 7px', borderRadius: 5,
                background: 'rgba(245,166,35,0.2)', border: '1px solid rgba(245,166,35,0.4)',
                fontSize: 10.5, fontWeight: 700, color: '#F5A623',
              }}>
                <ShieldAlert size={12} />
                DEMO DATA
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Demo data for 1 fictional patient (<strong>DEMO-001</strong>) is currently displayed. Real user data is kept strictly separate.
              </span>
            </div>
            <button
              id="clear-demo-banner-btn"
              onClick={() => dispatch({ type: 'CLEAR_DEMO_DATA' })}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--danger)',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Trash2 size={12} />
              Clear Demo Data
            </button>
          </div>
        )}

        {/* ── Collapsible Dataset Upload Modal / Card ───────────────────── */}
        {showUploadModal && (
          <GlassCard className="p-xl" style={{ border: '1px solid var(--accent-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Upload Adverse Events Dataset
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Import external CSV, XLSX, or JSON datasets into your active session.
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowUploadModal(false)}>
                <X size={14} />
              </Button>
            </div>
            <FileUpload
              id="ae-dataset-file-input"
              onFiles={async ([file]) => {
                const res = await handleUpload(file);
                if (res.success) {
                  setShowUploadModal(false);
                  setDatasetFilter('all');
                  triggerToast(`Adverse event dataset imported successfully (${res.count} records).`);
                } else {
                  triggerToast(res.message);
                }
              }}
              accept=".csv,.xlsx,.xls,.json"
              title="Drop your adverse event dataset here"
              description="Drag & drop CSV or Excel spreadsheet or click to select."
              formats={['CSV', 'XLSX', 'JSON']}
              loading={isUploading}
            />
            {uploadError && (
              <div className="alert alert--error mt-md">
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {uploadError}
              </div>
            )}
          </GlassCard>
        )}

        {/* ── MANUAL ENTRY LIQUID GLASS FORM ───────────────────────────── */}
        <div ref={formCardRef}>
          <GlassCard className="p-xl" style={{ position: 'relative' }}>
            {/* Header / Mode Indicator */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: '1px solid var(--glass-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: editId ? 'rgba(74,143,217,0.15)' : 'var(--glass-bg)',
                  border: `1px solid ${editId ? 'var(--accent-border)' : 'var(--glass-border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: editId ? 'var(--accent)' : 'var(--text-primary)',
                }}>
                  {editId ? <Pencil size={16} /> : <Plus size={16} />}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {editId ? `Edit Adverse Event (Case ${formData.reportId || ''})` : 'Add Adverse Event'}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {editId ? 'Modify the case parameters and click Save Case to update.' : 'Enter case information for safety analysis.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 14 }}>*</span>
                <span>Required fields</span>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Row 1: Case ID, Patient ID (Optional), Product/Drug Name, Dose */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr 1.3fr 1fr', gap: 16 }}>
                <FormField
                  label="Case ID"
                  required
                  error={formErrors.reportId}
                  hint="Unique identifier (e.g. CASE-2024-001)"
                >
                  <GlassInput
                    id="field-case-id"
                    value={formData.reportId}
                    onChange={v => updateField('reportId', v)}
                    placeholder="e.g. CASE-2024-001"
                    hasError={!!formErrors.reportId}
                  />
                </FormField>

                <FormField
                  label="Patient ID"
                  error={formErrors.patientId}
                  hint="Fictional or anonymized ID"
                >
                  <GlassInput
                    id="field-patient-id"
                    value={formData.patientId}
                    onChange={v => updateField('patientId', v)}
                    placeholder="e.g. DEMO-001"
                    hasError={!!formErrors.patientId}
                  />
                </FormField>

                <FormField
                  label="Product / Drug Name"
                  required
                  error={formErrors.drugName}
                  hint="Active pharmaceutical product"
                >
                  <GlassInput
                    id="field-drug-name"
                    value={formData.drugName}
                    onChange={v => updateField('drugName', v)}
                    placeholder="e.g. Metformin Hydrochloride"
                    hasError={!!formErrors.drugName}
                  />
                </FormField>

                <FormField
                  label="Dose"
                  error={formErrors.dose}
                  hint="e.g. 50 mg once daily"
                >
                  <GlassInput
                    id="field-dose"
                    value={formData.dose}
                    onChange={v => updateField('dose', v)}
                    placeholder="e.g. 50 mg daily"
                    hasError={!!formErrors.dose}
                  />
                </FormField>
              </div>

              {/* Row 2: Adverse Event & MedDRA Term */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: 18 }}>
                <FormField
                  label="Adverse Event"
                  required
                  error={formErrors.eventDescription}
                  hint="Reported reaction, symptom, or syndrome"
                >
                  <GlassInput
                    id="field-adverse-event"
                    value={formData.eventDescription}
                    onChange={v => updateField('eventDescription', v)}
                    placeholder="e.g. Severe persistent nausea and epigastric discomfort"
                    hasError={!!formErrors.eventDescription}
                  />
                </FormField>

                <FormField
                  label="MedDRA Term"
                  error={formErrors.meddraTermPreferred}
                  hint="Preferred Term (PT) coding"
                >
                  <GlassInput
                    id="field-meddra-term"
                    value={formData.meddraTermPreferred}
                    onChange={v => updateField('meddraTermPreferred', v)}
                    placeholder="e.g. Nausea (10028813)"
                    hasError={!!formErrors.meddraTermPreferred}
                  />
                </FormField>
              </div>

              {/* Row 3: Event Date, Report Date, Seriousness, Outcome */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                <FormField
                  label="Event Date"
                  error={formErrors.onsetDate}
                  hint="Onset date of event"
                >
                  <GlassInput
                    id="field-event-date"
                    type="date"
                    value={formData.onsetDate}
                    onChange={v => updateField('onsetDate', v)}
                    hasError={!!formErrors.onsetDate}
                  />
                </FormField>

                <FormField
                  label="Report Date"
                  error={formErrors.reportDate}
                  hint="Date case was reported"
                >
                  <GlassInput
                    id="field-report-date"
                    type="date"
                    value={formData.reportDate}
                    onChange={v => updateField('reportDate', v)}
                    hasError={!!formErrors.reportDate}
                  />
                </FormField>

                <FormField
                  label="Seriousness"
                  error={formErrors.seriousness}
                >
                  <GlassSelect
                    id="field-seriousness"
                    value={formData.seriousness}
                    onChange={v => updateField('seriousness', v)}
                    placeholder="Select Seriousness…"
                    options={[
                      { value: 'yes', label: 'Serious' },
                      { value: 'no', label: 'Non-serious' },
                    ]}
                    hasError={!!formErrors.seriousness}
                  />
                </FormField>

                <FormField
                  label="Outcome"
                  error={formErrors.outcome}
                >
                  <GlassSelect
                    id="field-outcome"
                    value={formData.outcome}
                    onChange={v => updateField('outcome', v)}
                    placeholder="Select Outcome…"
                    options={OUTCOME_OPTIONS}
                    hasError={!!formErrors.outcome}
                  />
                </FormField>
              </div>

              {/* Row 4: Patient Age, Patient Sex, Country, Indication, Reporter Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 1.2fr 1.2fr 1.2fr', gap: 16 }}>
                <FormField
                  label="Patient Age"
                  error={formErrors.patientAge}
                  hint="Years (0–130)"
                >
                  <GlassInput
                    id="field-patient-age"
                    type="number"
                    value={formData.patientAge}
                    onChange={v => updateField('patientAge', v)}
                    placeholder="e.g. 45"
                    hasError={!!formErrors.patientAge}
                  />
                </FormField>

                <FormField
                  label="Patient Sex"
                  error={formErrors.patientSex}
                >
                  <GlassSelect
                    id="field-patient-sex"
                    value={formData.patientSex}
                    onChange={v => updateField('patientSex', v)}
                    placeholder="Select Sex…"
                    options={SEX_OPTIONS}
                    hasError={!!formErrors.patientSex}
                  />
                </FormField>

                <FormField
                  label="Country"
                  error={formErrors.countryOfOccurrence}
                >
                  <GlassSelect
                    id="field-country"
                    value={formData.countryOfOccurrence}
                    onChange={v => updateField('countryOfOccurrence', v)}
                    placeholder="Select Country…"
                    options={COUNTRIES.map(c => ({ value: c, label: c }))}
                    hasError={!!formErrors.countryOfOccurrence}
                  />
                </FormField>

                <FormField
                  label="Indication"
                  error={formErrors.indication}
                  hint="Reason prescribed"
                >
                  <GlassInput
                    id="field-indication"
                    value={formData.indication}
                    onChange={v => updateField('indication', v)}
                    placeholder="e.g. Hypertension"
                    hasError={!!formErrors.indication}
                  />
                </FormField>

                <FormField
                  label="Reporter Type"
                  error={formErrors.reportType}
                >
                  <GlassSelect
                    id="field-reporter-type"
                    value={formData.reportType}
                    onChange={v => updateField('reportType', v)}
                    placeholder="Select Reporter…"
                    options={REPORTER_TYPES}
                    hasError={!!formErrors.reportType}
                  />
                </FormField>
              </div>

            </div>

            {/* Form Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 12,
              marginTop: 26,
              paddingTop: 18,
              borderTop: '1px solid var(--glass-border)',
            }}>
              <Button
                id="btn-cancel-ae"
                variant="secondary"
                onClick={handleCancel}
              >
                Cancel
              </Button>

              {!editId && (
                <Button
                  id="btn-save-add-another"
                  variant="secondary"
                  onClick={() => handleSave(true)}
                  title="Save this case and clear the form to add another"
                >
                  Save &amp; Add Another
                </Button>
              )}

              <Button
                id="btn-save-case"
                variant="primary"
                icon={<CheckCircle size={14} />}
                onClick={() => handleSave(false)}
              >
                {editId ? 'Update Case' : 'Save Case'}
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* ── USER'S DATASET TABLE ─────────────────────────────────────── */}
        <div>
          <GlassCard>
            {/* Table Header Controls */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Adverse Event Dataset
                </span>

                {/* Separation: Filter between All, User Data, Demo Data */}
                {hasDemo && userEvents.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, background: 'var(--glass-bg)', padding: 3, borderRadius: 8, border: '1px solid var(--glass-border)' }}>
                    <button
                      onClick={() => setDatasetFilter('all')}
                      style={{
                        padding: '4px 9px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: datasetFilter === 'all' ? 'var(--accent)' : 'transparent',
                        color: datasetFilter === 'all' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      All ({events.length})
                    </button>
                    <button
                      onClick={() => setDatasetFilter('user')}
                      style={{
                        padding: '4px 9px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: datasetFilter === 'user' ? 'var(--accent)' : 'transparent',
                        color: datasetFilter === 'user' ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      User Data ({userEvents.length})
                    </button>
                    <button
                      onClick={() => setDatasetFilter('demo')}
                      style={{
                        padding: '4px 9px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: 'none',
                        background: datasetFilter === 'demo' ? 'rgba(245,166,35,0.25)' : 'transparent',
                        color: datasetFilter === 'demo' ? '#F5A623' : 'var(--text-secondary)',
                        cursor: 'pointer',
                      }}
                    >
                      Demo Data ({demoEvents.length})
                    </button>
                  </div>
                )}

                {(!hasDemo || userEvents.length === 0) && (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: events.length > 0 ? (hasDemo ? 'rgba(245,166,35,0.15)' : 'var(--accent-muted)') : 'var(--glass-bg)',
                    color: events.length > 0 ? (hasDemo ? '#F5A623' : 'var(--text-accent)') : 'var(--text-tertiary)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    {events.length} {events.length === 1 ? 'record' : 'records'} {hasDemo && '(Demo)'}
                  </span>
                )}
              </div>

              {/* Search Bar */}
              {events.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 8,
                  padding: '6px 12px',
                  minWidth: 260,
                }}>
                  <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    id="table-search-input"
                    placeholder="Search by Case ID, drug, event, country…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: 12.5,
                      fontFamily: 'inherit',
                      width: '100%',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
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
              )}
            </div>

            {/* Empty State when zero user records exist */}
            {events.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                textAlign: 'center',
                gap: 14,
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-tertiary)',
                }}>
                  <Plus size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    No adverse-event data yet
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)', maxWidth: 380, lineHeight: 1.5, marginBottom: 14 }}>
                    Enter case information using the form above and click <strong>Save Case</strong>, or load the single fictional patient demo.
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<RotateCcw size={13} />}
                    onClick={() => dispatch({ type: 'LOAD_DEMO_DATA' })}
                  >
                    Load Demo Patient (DEMO-001)
                  </Button>
                </div>
              </div>
            ) : (
              /* Records Table */
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                      {[
                        'Case ID',
                        'Patient',
                        'Drug',
                        'Adverse Event',
                        'Seriousness',
                        'Outcome',
                        'Date',
                        'Actions',
                      ].map(heading => (
                        <th
                          key={heading}
                          style={{
                            padding: '11px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            color: 'var(--text-tertiary)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          style={{
                            padding: '36px 16px',
                            textAlign: 'center',
                            color: 'var(--text-tertiary)',
                            fontSize: 13,
                          }}
                        >
                          No cases match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map(ae => (
                        <tr
                          key={ae.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            transition: 'background 120ms ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {/* Case ID with Demo Badge if demo */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            fontSize: 12.5,
                            whiteSpace: 'nowrap',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{ae.reportId}</span>
                              {ae.isDemo && (
                                <span style={{
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  letterSpacing: '0.04em',
                                  padding: '1px 5px',
                                  borderRadius: 4,
                                  background: 'rgba(245,166,35,0.18)',
                                  color: '#F5A623',
                                  border: '1px solid rgba(245,166,35,0.35)',
                                }}>
                                  DEMO
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Patient */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-secondary)',
                            fontWeight: 500,
                            fontFamily: ae.patientId ? 'monospace' : 'inherit',
                            fontSize: 12.5,
                            whiteSpace: 'nowrap',
                          }}>
                            {ae.patientId || '—'}
                          </td>

                          {/* Drug */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {ae.drugName}
                          </td>

                          {/* Adverse Event */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-secondary)',
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {ae.eventDescription}
                          </td>

                          {/* Seriousness */}
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <StatusBadge
                              variant={ae.seriousness ? 'danger' : 'neutral'}
                              label={ae.seriousness ? 'Serious' : 'Non-serious'}
                              dot
                            />
                          </td>

                          {/* Outcome */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            textTransform: 'capitalize',
                          }}>
                            {ae.outcome}
                          </td>

                          {/* Date */}
                          <td style={{
                            padding: '12px 16px',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            fontSize: 12.5,
                          }}>
                            {ae.onsetDate ? formatDate(ae.onsetDate) : formatDate(ae.reportDate)}
                          </td>

                          {/* Actions: View, Edit, Delete */}
                          <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {/* View button */}
                              <button
                                id={`view-btn-${ae.id}`}
                                onClick={() => setViewingEvent(ae)}
                                title="View case details"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 7,
                                  border: '1px solid var(--glass-border)',
                                  background: 'var(--glass-bg)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 120ms ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg-hover)';
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg)';
                                }}
                              >
                                <Eye size={13} />
                              </button>

                              {/* Edit button */}
                              <button
                                id={`edit-btn-${ae.id}`}
                                onClick={() => startEdit(ae)}
                                title="Edit case"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 7,
                                  border: '1px solid var(--glass-border)',
                                  background: 'var(--glass-bg)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 120ms ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-muted)';
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg)';
                                }}
                              >
                                <Pencil size={12} />
                              </button>

                              {/* Delete button */}
                              <button
                                id={`delete-btn-${ae.id}`}
                                onClick={() => setDeletingEvent(ae)}
                                title="Delete case"
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 7,
                                  border: '1px solid var(--glass-border)',
                                  background: 'var(--glass-bg)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--text-secondary)',
                                  transition: 'all 120ms ease',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-muted)';
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--glass-bg)';
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

      {/* ── View Modal ─────────────────────────────────────────────────── */}
      {viewingEvent && (
        <ViewCaseModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
        />
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────── */}
      {deletingEvent && (
        <DeleteConfirmModal
          event={deletingEvent}
          onCancel={() => setDeletingEvent(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* ── Success Toast ──────────────────────────────────────────────── */}
      {toastMessage && (
        <SuccessToast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </>
  );
}
