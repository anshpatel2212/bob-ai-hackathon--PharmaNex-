import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { AdverseEvent, ParseError, SeverityLevel, OutcomeType, CausalityAssessment, ReportType } from '../types/adverseEvent';
import type { CTDModule, DocumentFormat } from '../types/document';

// ─── ID generator ─────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── AE field normalizers ─────────────────────────────────────────────────────

const SEVERITY_MAP: Record<string, SeverityLevel> = {
  mild: 'mild', moderate: 'moderate', severe: 'severe',
  'life-threatening': 'life-threatening', 'life threatening': 'life-threatening',
  fatal: 'fatal', death: 'fatal',
};

const OUTCOME_MAP: Record<string, OutcomeType> = {
  recovered: 'recovered', recovering: 'recovering',
  'not recovered': 'not-recovered', 'not-recovered': 'not-recovered',
  fatal: 'fatal', death: 'fatal', unknown: 'unknown',
};

const CAUSALITY_MAP: Record<string, CausalityAssessment> = {
  certain: 'certain', probable: 'probable', possible: 'possible',
  unlikely: 'unlikely', unclassifiable: 'unclassifiable',
};

const REPORT_TYPE_MAP: Record<string, ReportType> = {
  spontaneous: 'spontaneous', 'clinical trial': 'clinical-trial',
  'clinical-trial': 'clinical-trial', literature: 'literature', regulatory: 'regulatory',
};

function normalizeSeverity(raw: string): SeverityLevel {
  return SEVERITY_MAP[raw.toLowerCase().trim()] ?? 'moderate';
}

function normalizeOutcome(raw: string): OutcomeType {
  return OUTCOME_MAP[raw.toLowerCase().trim()] ?? 'unknown';
}

function normalizeCausality(raw: string): CausalityAssessment {
  return CAUSALITY_MAP[raw.toLowerCase().trim()] ?? 'possible';
}

function normalizeReportType(raw: string): ReportType {
  return REPORT_TYPE_MAP[raw.toLowerCase().trim()] ?? 'spontaneous';
}

function normalizeBoolean(raw: unknown): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  if (typeof raw === 'number') return raw !== 0;
  return false;
}

export function parseDateFlexible(val: string | number | undefined | null): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === 'number') {
    // Excel serial date: days since 1899-12-30
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  if (!str) return undefined;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  if (/^\d{4}\/\d{2}\/\d{2}/.test(str)) return str.slice(0, 10).replace(/\//g, '-');

  // Handle DD/MM/YYYY or MM/DD/YYYY or DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const [y, m, d] = parts;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      const [p1, p2, y] = parts;
      const n1 = parseInt(p1, 10);
      const n2 = parseInt(p2, 10);
      if (n1 > 12) {
        // DD/MM/YYYY
        return `${y}-${String(n2).padStart(2, '0')}-${String(n1).padStart(2, '0')}`;
      } else {
        // Assume MM/DD/YYYY
        return `${y}-${String(n1).padStart(2, '0')}-${String(n2).padStart(2, '0')}`;
      }
    }
  }

  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }
  return undefined;
}

// ─── Row → AdverseEvent ───────────────────────────────────────────────────────

export interface ParsedAEResult {
  events: AdverseEvent[];
  errors: ParseError[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRowField(row: Record<string, any>, aliases: string[]): string {
  if (!row || typeof row !== 'object') return '';
  const keys = Object.keys(row);
  
  // 1. Direct match (exact key)
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
      return String(row[alias]).trim();
    }
  }

  // 2. Case-insensitive and punctuation/space-agnostic match
  const normAliasSet = aliases.map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (const k of keys) {
    const normKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normAliasSet.includes(normKey)) {
      if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
        return String(row[k]).trim();
      }
    }
  }

  // 3. Substring match (e.g. key contains 'drug' or 'product')
  for (const k of keys) {
    const lowerKey = k.toLowerCase();
    for (const alias of aliases) {
      if (alias.length >= 4 && lowerKey.includes(alias.toLowerCase())) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
    }
  }

  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAdverseEvent(row: Record<string, any>, rowIndex: number, errors: ParseError[]): AdverseEvent | null {
  let drugName = getRowField(row, [
    'drugName', 'drug_name', 'drug', 'product', 'productName', 'product_name',
    'medicine', 'medication', 'substance', 'drug_product', 'drug product', 'product name'
  ]);

  let eventDescription = getRowField(row, [
    'eventDescription', 'event_description', 'adverseEvent', 'adverse_event', 'event',
    'adverseReaction', 'adverse_reaction', 'reaction', 'reaction_term', 'event_term',
    'symptom', 'sideEffect', 'side_effect', 'meddra_pt', 'preferred_term', 'preferred term',
    'adverse event', 'adverse events', 'pt_name'
  ]);

  // Fallback: If headers are completely non-standard, use the first two non-empty columns
  if (!drugName || !eventDescription) {
    const nonIdKeys = Object.keys(row).filter(k => {
      const lk = k.toLowerCase();
      return !lk.includes('id') && !lk.includes('date') && !lk.includes('time');
    });
    if (!drugName && nonIdKeys.length > 0 && row[nonIdKeys[0]]) {
      drugName = String(row[nonIdKeys[0]]).trim();
    }
    if (!eventDescription && nonIdKeys.length > 1 && row[nonIdKeys[1]]) {
      eventDescription = String(row[nonIdKeys[1]]).trim();
    }
  }

  if (!drugName) {
    errors.push({ row: rowIndex, field: 'drugName', message: 'Drug name is required' });
    return null;
  }
  if (!eventDescription) {
    errors.push({ row: rowIndex, field: 'eventDescription', message: 'Event description is required' });
    return null;
  }

  const rawReportId = getRowField(row, [
    'reportId', 'report_id', 'caseId', 'case_id', 'case_number', 'case id', 'report id', 'id', 'case'
  ]);

  const rawReportDate = getRowField(row, [
    'reportDate', 'report_date', 'date', 'receipt_date', 'received_date', 'report date'
  ]);

  const rawOnsetDate = getRowField(row, [
    'onsetDate', 'onset_date', 'eventDate', 'event_date', 'start_date', 'onset', 'event date'
  ]);

  const rawPatientId = getRowField(row, [
    'patientId', 'patient_id', 'subjectId', 'subject_id', 'patient', 'subject', 'patient id'
  ]);

  const rawSeriousness = getRowField(row, [
    'seriousness', 'serious', 'is_serious', 'isSerious'
  ]);

  const rawSeverity = getRowField(row, [
    'severity', 'grade', 'intensity'
  ]);

  const rawOutcome = getRowField(row, [
    'outcome', 'event_outcome', 'clinical_outcome', 'result'
  ]);

  const rawAge = getRowField(row, [
    'patientAge', 'patient_age', 'age', 'patient age'
  ]);

  const rawSex = getRowField(row, [
    'patientSex', 'patient_sex', 'sex', 'gender', 'patient sex'
  ]);

  const rawCountry = getRowField(row, [
    'countryOfOccurrence', 'country_of_occurrence', 'country', 'reporter_country'
  ]);

  const rawIndication = getRowField(row, [
    'indication', 'reason_for_use', 'diagnosis', 'prescribed_for'
  ]);

  const rawDose = getRowField(row, [
    'dose', 'dosage', 'daily_dose', 'regimen'
  ]);

  const rawMedDRA = getRowField(row, [
    'meddraTermPreferred', 'meddra_term_preferred', 'meddra_pt', 'meddraTerm', 'meddra', 'pt'
  ]);

  const rawReportType = getRowField(row, [
    'reportType', 'report_type', 'reporter_type', 'source_type', 'reporter'
  ]);

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const reportDate = parseDateFlexible(rawReportDate) || today;
  const onsetDate = parseDateFlexible(rawOnsetDate);

  const ageNum = rawAge ? Number(rawAge) : undefined;

  return {
    id: generateId(),
    reportId: rawReportId || `CASE-${new Date().getFullYear()}-${String(rowIndex).padStart(4, '0')}`,
    patientId: rawPatientId || undefined,
    drugName,
    activeIngredient: getRowField(row, ['activeIngredient', 'active_ingredient', 'substance']) || undefined,
    batchNumber: getRowField(row, ['batchNumber', 'batch_number', 'lot']) || undefined,
    patientAge: !isNaN(ageNum as number) && (ageNum as number) >= 0 ? ageNum : undefined,
    patientSex: (['male', 'female'].includes(rawSex.toLowerCase())
      ? rawSex.toLowerCase() as 'male' | 'female'
      : 'unknown'),
    eventDescription,
    meddraTermPreferred: rawMedDRA || eventDescription,
    meddraTermHlt: getRowField(row, ['meddraTermHlt', 'meddra_hlt']) || undefined,
    severity: normalizeSeverity(rawSeverity || (normalizeBoolean(rawSeriousness) ? 'severe' : 'moderate')),
    outcome: normalizeOutcome(rawOutcome || 'unknown'),
    causality: normalizeCausality(getRowField(row, ['causality']) || 'possible'),
    reportType: normalizeReportType(rawReportType || 'spontaneous'),
    reportDate,
    onsetDate,
    seriousness: normalizeBoolean(rawSeriousness),
    hospitalizationRequired: normalizeBoolean(getRowField(row, ['hospitalizationRequired', 'hospitalization'])),
    lifeThreatening: normalizeBoolean(getRowField(row, ['lifeThreatening', 'life_threatening'])),
    concomitantMedications: getRowField(row, ['concomitantMedications', 'concomitant_medications'])
      .split(';').map(s => s.trim()).filter(Boolean),
    countryOfOccurrence: rawCountry || undefined,
    source: getRowField(row, ['source']) || undefined,
    narrativeSummary: getRowField(row, ['narrativeSummary', 'narrative', 'comment']) || undefined,
    indication: rawIndication || undefined,
    dose: rawDose || undefined,
    status: 'new',
    entryMethod: 'upload',
    isDemo: false,
    uploadedAt: now,
  };
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

export async function parseCSV(file: File): Promise<ParsedAEResult> {
  return new Promise((resolve) => {
    const errors: ParseError[] = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const events: AdverseEvent[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results.data.forEach((row: any, i) => {
          const event = rowToAdverseEvent(row, i + 2, errors);
          if (event) events.push(event);
        });
        resolve({ events, errors });
      },
      error: (err) => {
        errors.push({ row: 0, field: 'file', message: err.message });
        resolve({ events: [], errors });
      },
    });
  });
}

// ─── XLSX Parser ──────────────────────────────────────────────────────────────

export async function parseXLSX(file: File): Promise<ParsedAEResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: ParseError[] = [];

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

        const events: AdverseEvent[] = [];
        rows.forEach((row, i) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const event = rowToAdverseEvent(row as Record<string, any>, i + 2, errors);
          if (event) events.push(event);
        });

        resolve({ events, errors });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to parse Excel file';
        errors.push({ row: 0, field: 'file', message: `Failed to parse Excel file: ${msg}` });
        resolve({ events: [], errors });
      }
    };

    reader.onerror = () => {
      errors.push({ row: 0, field: 'file', message: 'File read error' });
      resolve({ events: [], errors });
    };

    reader.readAsArrayBuffer(file);
  });
}

// ─── JSON Parser ──────────────────────────────────────────────────────────────

export async function parseJSON(file: File): Promise<ParsedAEResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const errors: ParseError[] = [];

    reader.onload = (e) => {
      try {
        const text = e.target!.result as string;
        const parsed = JSON.parse(text);
        const rows = Array.isArray(parsed) ? parsed : parsed.data ?? parsed.events ?? [];

        if (!Array.isArray(rows)) {
          errors.push({ row: 0, field: 'file', message: 'JSON must contain an array of records' });
          resolve({ events: [], errors });
          return;
        }

        const events: AdverseEvent[] = [];
        rows.forEach((row, i) => {
          const event = rowToAdverseEvent(row, i + 1, errors);
          if (event) events.push(event);
        });

        resolve({ events, errors });
      } catch {
        errors.push({ row: 0, field: 'file', message: 'Invalid JSON format' });
        resolve({ events: [], errors });
      }
    };

    reader.onerror = () => {
      errors.push({ row: 0, field: 'file', message: 'File read error' });
      resolve({ events: [], errors });
    };

    reader.readAsText(file);
  });
}

// ─── Document helpers ─────────────────────────────────────────────────────────

export function detectDocumentFormat(fileName: string): DocumentFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, DocumentFormat> = {
    pdf: 'pdf', docx: 'docx', doc: 'docx', xlsx: 'xlsx', xml: 'xml', txt: 'txt', csv: 'xlsx',
  };
  return map[ext ?? ''] ?? 'unknown';
}

export function detectCTDModule(fileName: string): CTDModule {
  const lower = fileName.toLowerCase();
  if (lower.includes('module1') || lower.includes('mod1') || lower.includes('m1')) return 'module1';
  if (lower.includes('module2') || lower.includes('mod2') || lower.includes('m2')) return 'module2';
  if (lower.includes('module3') || lower.includes('mod3') || lower.includes('m3') || lower.includes('quality')) return 'module3';
  if (lower.includes('module4') || lower.includes('mod4') || lower.includes('m4') || lower.includes('nonclinical')) return 'module4';
  if (lower.includes('module5') || lower.includes('mod5') || lower.includes('m5') || lower.includes('clinical')) return 'module5';
  return 'module2';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
