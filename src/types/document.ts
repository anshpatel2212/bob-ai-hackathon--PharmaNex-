export type DocumentStatus = 'complete' | 'incomplete' | 'missing' | 'under-review';
export type CTDModule = 'module1' | 'module2' | 'module3' | 'module4' | 'module5';
export type DocumentFormat = 'pdf' | 'docx' | 'xlsx' | 'xml' | 'txt' | 'unknown';

export interface CTDSection {
  code: string;          // e.g. "3.2.S.1"
  title: string;         // e.g. "General Information"
  module: CTDModule;
  required: boolean;
  status: DocumentStatus;
  documentIds: string[];
}

export interface CTDDocument {
  id: string;
  fileName: string;
  fileSize: number;       // bytes
  format: DocumentFormat;
  module: CTDModule;
  sectionCode?: string;   // e.g. "3.2.S.1"
  sectionTitle?: string;
  uploadedAt: string;     // ISO timestamp
  status: DocumentStatus;
  pageCount?: number;
  notes?: string;
}

export interface DocumentUploadResult {
  fileName: string;
  fileSize: number;
  success: boolean;
  documentId?: string;
  error?: string;
}

export interface CTDModuleSummary {
  module: CTDModule;
  label: string;
  totalSections: number;
  completeSections: number;
  incompleteSections: number;
  missingSections: number;
  completionPercentage: number;
}

export const CTD_MODULE_LABELS: Record<CTDModule, string> = {
  module1: 'Module 1 — Regional Administrative',
  module2: 'Module 2 — Common Technical Document Summaries',
  module3: 'Module 3 — Quality',
  module4: 'Module 4 — Nonclinical Study Reports',
  module5: 'Module 5 — Clinical Study Reports',
};
