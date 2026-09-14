import type { AdverseEvent, AdverseEventFilters, AdverseEventUpload } from '../types/adverseEvent';
import type { ParsedAEResult } from '../utils/parsers';
import { parseCSV, parseXLSX, parseJSON, generateId } from '../utils/parsers';

export type SupportedAEFormat = 'csv' | 'xlsx' | 'json';

export function detectFormat(file: File): SupportedAEFormat | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls') return 'xlsx';
  if (ext === 'json') return 'json';
  return null;
}

export async function uploadAdverseEvents(file: File): Promise<{
  result: ParsedAEResult;
  upload: AdverseEventUpload;
}> {
  const format = detectFormat(file);
  if (!format) throw new Error('Unsupported file format. Please use CSV, XLSX, or JSON.');

  let result: ParsedAEResult;
  if (format === 'csv') result = await parseCSV(file);
  else if (format === 'xlsx') result = await parseXLSX(file);
  else result = await parseJSON(file);

  const upload: AdverseEventUpload = {
    fileName: file.name,
    fileSize: file.size,
    recordCount: result.events.length + result.errors.filter(e => e.field !== 'file').length,
    uploadedAt: new Date().toISOString(),
    validRecords: result.events.length,
    invalidRecords: result.errors.filter(e => e.field !== 'file').length,
    errors: result.errors,
  };

  return { result, upload };
}

export function filterAdverseEvents(events: AdverseEvent[], filters: AdverseEventFilters): AdverseEvent[] {
  return events.filter(ev => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !ev.drugName.toLowerCase().includes(q) &&
        !ev.eventDescription.toLowerCase().includes(q) &&
        !(ev.meddraTermPreferred?.toLowerCase().includes(q)) &&
        !ev.reportId.toLowerCase().includes(q)
      ) return false;
    }
    if (filters.severity !== 'all' && ev.severity !== filters.severity) return false;
    if (filters.outcome !== 'all' && ev.outcome !== filters.outcome) return false;
    if (filters.causality !== 'all' && ev.causality !== filters.causality) return false;
    if (filters.seriousOnly && !ev.seriousness) return false;
    if (filters.dateFrom && ev.reportDate < filters.dateFrom) return false;
    if (filters.dateTo && ev.reportDate > filters.dateTo) return false;
    return true;
  });
}

export function getAESummaryStats(events: AdverseEvent[]) {
  const total = events.length;
  const serious = events.filter(e => e.seriousness).length;
  const bySeverity = {
    mild: events.filter(e => e.severity === 'mild').length,
    moderate: events.filter(e => e.severity === 'moderate').length,
    severe: events.filter(e => e.severity === 'severe').length,
    'life-threatening': events.filter(e => e.severity === 'life-threatening').length,
    fatal: events.filter(e => e.severity === 'fatal').length,
  };

  const drugCounts = events.reduce((acc, e) => {
    acc[e.drugName] = (acc[e.drugName] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topDrug = Object.entries(drugCounts).sort((a, b) => b[1] - a[1])[0];

  return { total, serious, bySeverity, topDrug: topDrug ? { name: topDrug[0], count: topDrug[1] } : null };
}

// Unused id export to satisfy potential usage
export { generateId };
