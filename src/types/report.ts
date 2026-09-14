export type ReportStatus = 'draft' | 'final' | 'archived';
export type ReportCategory = 'safety' | 'submission' | 'signal' | 'gap-analysis' | 'combined';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Report {
  id: string;
  title: string;
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  generatedBy: string;     // user name / system
  summary: string;
  sections: ReportSection[];
  metadata: ReportMetadata;
}

export interface ReportMetadata {
  adverseEventsIncluded: number;
  signalsIncluded: number;
  documentsIncluded: number;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  drugNames: string[];
}

export interface ReportGenerationRequest {
  title: string;
  category: ReportCategory;
  includeAdverseEvents: boolean;
  includeSignals: boolean;
  includeDocuments: boolean;
  includeGapAnalysis: boolean;
  dateRangeFrom?: string;
  dateRangeTo?: string;
  drugFilter?: string;
  notes?: string;
}
