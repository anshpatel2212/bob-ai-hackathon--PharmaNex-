export type SignalStrength = 'weak' | 'moderate' | 'strong';
export type SignalStatus = 'new' | 'under-review' | 'validated' | 'closed' | 'false-positive';
export type SignalPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Signal {
  id: string;
  drugName: string;
  eventTerm: string;
  reportingOddsRatio: number;
  ror95CiLower: number;
  ror95CiUpper: number;
  informationComponent: number;
  caseCount: number;
  expectedCount: number;
  strength: SignalStrength;
  priority: SignalPriority;
  status: SignalStatus;
  detectedAt: string;       // ISO timestamp
  lastUpdatedAt: string;    // ISO timestamp
  reviewNote?: string;
  relatedEventIds: string[];
  proportionalReportingRatio?: number;
  seriousCount?: number;
  trend?: 'increasing' | 'stable' | 'decreasing';
}

export interface SignalAnalysisRun {
  id: string;
  runAt: string;
  totalSignals: number;
  newSignals: number;
  criticalSignals: number;
  eventsAnalyzed: number;
  method: 'disproportionality' | 'bayesian';
}

export interface DisproportionalityResult {
  drugName: string;
  eventTerm: string;
  observed: number;
  expected: number;
  ror: number;
  ror95Lower: number;
  ror95Upper: number;
  ic: number;
  ebgm: number;
  isSignal: boolean;
}
