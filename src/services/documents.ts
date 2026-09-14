import type { CTDDocument, CTDModule, CTDModuleSummary, CTDSection } from '../types/document';
import { CTD_MODULE_LABELS } from '../types/document';
import { detectDocumentFormat, detectCTDModule, generateId } from '../utils/parsers';

// ─── Known CTD sections (required set) ───────────────────────────────────────
// Based on ICH M4 CTD structure (simplified)

const REQUIRED_CTD_SECTIONS: Array<{ code: string; title: string; module: CTDModule; required: boolean }> = [
  // Module 1
  { code: '1.0', title: 'Cover Letter', module: 'module1', required: true },
  { code: '1.1', title: 'Comprehensive Table of Contents', module: 'module1', required: true },
  { code: '1.2', title: 'Application Form', module: 'module1', required: true },
  { code: '1.3', title: 'Product Labeling', module: 'module1', required: true },

  // Module 2
  { code: '2.1', title: 'CTD Table of Contents', module: 'module2', required: true },
  { code: '2.2', title: 'Introduction', module: 'module2', required: true },
  { code: '2.3', title: 'Quality Overall Summary', module: 'module2', required: true },
  { code: '2.4', title: 'Nonclinical Overview', module: 'module2', required: true },
  { code: '2.5', title: 'Clinical Overview', module: 'module2', required: true },
  { code: '2.6', title: 'Nonclinical Written and Tabulated Summaries', module: 'module2', required: true },
  { code: '2.7', title: 'Clinical Summary', module: 'module2', required: true },

  // Module 3
  { code: '3.2.S.1', title: 'General Information (Drug Substance)', module: 'module3', required: true },
  { code: '3.2.S.2', title: 'Manufacture (Drug Substance)', module: 'module3', required: true },
  { code: '3.2.S.3', title: 'Characterisation (Drug Substance)', module: 'module3', required: true },
  { code: '3.2.S.4', title: 'Control of Drug Substance', module: 'module3', required: true },
  { code: '3.2.S.5', title: 'Reference Standards or Materials', module: 'module3', required: false },
  { code: '3.2.S.6', title: 'Container Closure System (Drug Substance)', module: 'module3', required: true },
  { code: '3.2.S.7', title: 'Stability (Drug Substance)', module: 'module3', required: true },
  { code: '3.2.P.1', title: 'Description and Composition (Drug Product)', module: 'module3', required: true },
  { code: '3.2.P.2', title: 'Pharmaceutical Development', module: 'module3', required: true },
  { code: '3.2.P.3', title: 'Manufacture (Drug Product)', module: 'module3', required: true },
  { code: '3.2.P.4', title: 'Control of Excipients', module: 'module3', required: false },
  { code: '3.2.P.5', title: 'Control of Drug Product', module: 'module3', required: true },
  { code: '3.2.P.8', title: 'Stability (Drug Product)', module: 'module3', required: true },

  // Module 4
  { code: '4.2.1', title: 'Pharmacology', module: 'module4', required: true },
  { code: '4.2.2', title: 'Pharmacokinetics', module: 'module4', required: true },
  { code: '4.2.3', title: 'Toxicology', module: 'module4', required: true },

  // Module 5
  { code: '5.2', title: 'Tabular Listing of Clinical Studies', module: 'module5', required: true },
  { code: '5.3.1', title: 'Bioavailability Study Reports', module: 'module5', required: false },
  { code: '5.3.3', title: 'Efficacy Study Reports', module: 'module5', required: true },
  { code: '5.3.5', title: 'Safety Study Reports', module: 'module5', required: true },
  { code: '5.3.7', title: 'Integrated Summary of Safety', module: 'module5', required: true },
  { code: '5.4', title: 'Literature References', module: 'module5', required: false },
];

export function createDocumentFromFile(file: File, sectionCode?: string): CTDDocument {
  const module = detectCTDModule(file.name);
  const format = detectDocumentFormat(file.name);
  const lowerName = file.name.toLowerCase();

  let section = REQUIRED_CTD_SECTIONS.find(s => s.code === sectionCode);

  // If no explicit sectionCode, try to match by code or title in filename
  if (!section) {
    section = REQUIRED_CTD_SECTIONS.find(s => {
      const codeClean = s.code.toLowerCase();
      return lowerName.includes(codeClean) ||
             lowerName.includes(codeClean.replace(/\./g, '_')) ||
             lowerName.includes(codeClean.replace(/\./g, '-'));
    });
  }

  if (!section) {
    // Check if filename contains distinct keywords from section title
    section = REQUIRED_CTD_SECTIONS.find(s => {
      const titleWords = s.title.toLowerCase().split(/[\s()]+/).filter(w => w.length > 5);
      return titleWords.some(w => lowerName.includes(w)) && s.module === module;
    });
  }

  const effectiveModule = section ? section.module : module;

  return {
    id: generateId(),
    fileName: file.name,
    fileSize: file.size,
    format,
    module: effectiveModule,
    sectionCode: section?.code ?? sectionCode,
    sectionTitle: section?.title,
    uploadedAt: new Date().toISOString(),
    status: 'under-review',
    notes: undefined,
  };
}

export function computeCTDSections(documents: CTDDocument[]): CTDSection[] {
  return REQUIRED_CTD_SECTIONS.map(def => {
    const matchingDocs = documents.filter(
      d => d.sectionCode === def.code ||
           (d.sectionTitle && d.sectionTitle.toLowerCase() === def.title.toLowerCase())
    );
    let status: CTDSection['status'] = 'missing';
    if (matchingDocs.length > 0) {
      const hasComplete = matchingDocs.some(d => d.status === 'complete');
      const hasReview = matchingDocs.some(d => d.status === 'under-review');
      if (hasComplete) status = 'complete';
      else if (hasReview) status = 'incomplete';
      else status = 'incomplete';
    }

    return {
      code: def.code,
      title: def.title,
      module: def.module,
      required: def.required,
      status,
      documentIds: matchingDocs.map(d => d.id),
    };
  });
}

export function computeModuleSummaries(documents: CTDDocument[]): CTDModuleSummary[] {
  const sections = computeCTDSections(documents);
  const modules: CTDModule[] = ['module1', 'module2', 'module3', 'module4', 'module5'];

  return modules.map(module => {
    const moduleSections = sections.filter(s => s.module === module);
    const complete = moduleSections.filter(s => s.status === 'complete').length;
    const incomplete = moduleSections.filter(s => s.status === 'incomplete').length;
    const missing = moduleSections.filter(s => s.status === 'missing').length;
    const total = moduleSections.length;

    return {
      module,
      label: CTD_MODULE_LABELS[module],
      totalSections: total,
      completeSections: complete,
      incompleteSections: incomplete,
      missingSections: missing,
      completionPercentage: total > 0 ? Math.round((complete / total) * 100) : 0,
    };
  });
}

export function detectGaps(documents: CTDDocument[]): Array<{
  module: CTDModule;
  sectionCode: string;
  sectionTitle: string;
  required: boolean;
  recommendation: string;
}> {
  const sections = computeCTDSections(documents);
  return sections
    .filter(s => s.status === 'missing' || s.status === 'incomplete')
    .map(s => ({
      module: s.module,
      sectionCode: s.code,
      sectionTitle: s.title,
      required: s.required,
      recommendation: s.status === 'missing'
        ? `Upload document(s) for section ${s.code}: ${s.title}`
        : `Review and complete section ${s.code}: ${s.title}`,
    }));
}
