export type SeverityLevel = 'mild' | 'moderate' | 'severe' | 'life-threatening' | 'fatal';
export type OutcomeType = 'recovered' | 'recovering' | 'not-recovered' | 'fatal' | 'unknown';
export type CausalityAssessment = 'certain' | 'probable' | 'possible' | 'unlikely' | 'unclassifiable';
export type ReportType = 'spontaneous' | 'clinical-trial' | 'literature' | 'regulatory' | 'healthcare-professional' | 'consumer' | 'other';

export type AEStatus = 'new' | 'under-review' | 'closed';
export type EntryMethod = 'upload' | 'manual';

export interface AdverseEvent {
  id: string;
  reportId: string;
  drugName: string;
  activeIngredient?: string;
  batchNumber?: string;
  patientAge?: number;
  patientSex?: 'male' | 'female' | 'other' | 'unknown';
  eventDescription: string;
  meddraTermPreferred?: string;
  meddraTermHlt?: string;
  severity: SeverityLevel;
  outcome: OutcomeType;
  causality: CausalityAssessment;
  reportType: ReportType;
  reportDate: string;
  onsetDate?: string;
  seriousness: boolean;
  hospitalizationRequired?: boolean;
  lifeThreatening?: boolean;
  concomitantMedications?: string[];
  countryOfOccurrence?: string;
  source?: string;
  narrativeSummary?: string;
  indication?: string;
  dose?: string;
  patientId?: string;
  isDemo?: boolean;
  status: AEStatus;
  entryMethod: EntryMethod;
  uploadedAt: string;
}

export interface AdverseEventUpload {
  fileName: string;
  fileSize: number;
  recordCount: number;
  uploadedAt: string;
  validRecords: number;
  invalidRecords: number;
  errors: ParseError[];
}

export interface ParseError {
  row: number;
  field: string;
  message: string;
}

export interface AdverseEventFilters {
  search: string;
  severity: SeverityLevel | 'all';
  outcome: OutcomeType | 'all';
  causality: CausalityAssessment | 'all';
  dateFrom: string;
  dateTo: string;
  seriousOnly: boolean;
}

export const defaultFilters: AdverseEventFilters = {
  search: '',
  severity: 'all',
  outcome: 'all',
  causality: 'all',
  dateFrom: '',
  dateTo: '',
  seriousOnly: false,
};
