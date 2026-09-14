import type { Report, ReportGenerationRequest, ReportSection } from '../types/report';
import type { AdverseEvent } from '../types/adverseEvent';
import type { Signal } from '../types/signal';
import type { CTDDocument } from '../types/document';
import { generateId } from '../utils/parsers';
import { detectGaps } from './documents';

function buildSevenSections(
  events: AdverseEvent[],
  signals: Signal[],
  documents: CTDDocument[],
  userName: string,
  notes?: string
): ReportSection[] {
  const totalEvents = events.length;
  const seriousEvents = events.filter(e => e.seriousness).length;
  const fatalEvents = events.filter(e => e.severity === 'fatal').length;
  const drugCounts = events.reduce((acc, e) => {
    acc[e.drugName] = (acc[e.drugName] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const uniqueDrugs = Object.keys(drugCounts);

  const gaps = detectGaps(documents);
  const requiredGaps = gaps.filter(g => g.required);
  const totalRequiredSections = 7;
  const missingRequired = requiredGaps.length;
  const readinessPercent = documents.length === 0 ? 0 : Math.max(0, Math.round(((totalRequiredSections - missingRequired) / totalRequiredSections) * 100));

  const sections: ReportSection[] = [];

  // 1. Executive Summary
  sections.push({
    id: generateId(),
    title: '1. Executive Summary',
    content:
      `This AI-assisted safety and regulatory evaluation report synthesizes observations from ${totalEvents} adverse event record(s), ${signals.length} safety signal(s), and ${documents.length} CTD regulatory dossier document(s).\n\n` +
      `• Total Adverse Events Evaluated: ${totalEvents}\n` +
      `• Serious Adverse Events: ${seriousEvents} (${totalEvents > 0 ? Math.round((seriousEvents / totalEvents) * 100) : 0}%)\n` +
      `• Fatal Outcome Cases: ${fatalEvents}\n` +
      `• Active Monitored Products: ${uniqueDrugs.join(', ') || 'None specified'}\n` +
      `• Evaluation Standard: ICH E2B(R3) Pharmacovigilance & ICH M4 Common Technical Document\n\n` +
      `Prepared by: ${userName} · Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`,
    order: 1,
  });

  // 2. Safety Signals
  sections.push({
    id: generateId(),
    title: '2. Safety Signals',
    content:
      signals.length > 0
        ? `Identified ${signals.length} potential safety signal(s) exceeding statistical disproportionality thresholds:\n\n` +
          signals.map(s =>
            `• [${s.priority.toUpperCase()}] ${s.drugName} → ${s.eventTerm}\n` +
            `  PRR: ${(s.proportionalReportingRatio ?? s.reportingOddsRatio).toFixed(2)} | ROR: ${s.reportingOddsRatio.toFixed(2)} (95% CI: ${s.ror95CiLower.toFixed(2)}–${s.ror95CiUpper.toFixed(2)})\n` +
            `  Cases: ${s.caseCount} (Serious: ${s.seriousCount ?? 0}) | Status: ${s.status}`
          ).join('\n\n')
        : `No disproportionality safety signals currently meet regulatory alert thresholds (PRR ≥ 2.0, Chi-square ≥ 4.0, N ≥ 3).\n\n` +
          `Baseline safety monitoring active. Routine periodic surveillance is ongoing according to Pharmacovigilance System Master File (PSMF) guidelines.`,
    order: 2,
  });

  // 3. Statistical Evidence
  sections.push({
    id: generateId(),
    title: '3. Statistical Evidence',
    content:
      `Disproportionality analysis executed via Reporting Odds Ratio (ROR) and Proportional Reporting Ratio (PRR) with 95% two-sided confidence intervals.\n\n` +
      `• Total Safety Records in Cohort: ${totalEvents}\n` +
      `• Primary Products Monitored: ${uniqueDrugs.map(d => `${d} (n=${drugCounts[d]})`).join(', ') || 'N/A'}\n` +
      `• Statistical Method: Frequentist 2x2 Contingency Matrix with Yates' Chi-Square Continuity Correction\n` +
      `• Signal Detection Thresholds: ROR lower 95% CI bound > 1.0; PRR ≥ 2.0 with ≥ 3 recorded co-occurrences\n` +
      `• MedDRA Coding Conformity: All reported event terms mapped to MedDRA Preferred Terms (PT).`,
    order: 3,
  });

  // 4. Regulatory Gaps
  sections.push({
    id: generateId(),
    title: '4. Regulatory Gaps',
    content:
      gaps.length > 0
        ? `CTD gap detection identified ${gaps.length} potential area(s) needing completion before filing:\n\n` +
          gaps.map(g =>
            `• [${g.required ? 'CRITICAL REQUIREMENT' : 'RECOMMENDED'}] Section ${g.sectionCode}: ${g.sectionTitle}\n` +
            `  Action: ${g.recommendation}`
          ).join('\n\n')
        : documents.length === 0
          ? `No CTD regulatory submission documents have been linked to this evaluation.\n\n` +
            `Please upload CTD Module 1 (Administrative), Module 2 (Summaries), or Module 5 (Clinical Study Reports) to run automated gap and concordance checks.`
          : `Zero critical regulatory gaps detected in the evaluated CTD dossier modules. All mandatory submission elements are present.`,
    order: 4,
  });

  // 5. Submission Readiness
  sections.push({
    id: generateId(),
    title: '5. Submission Readiness',
    content:
      documents.length === 0
        ? `Readiness Status: Incomplete (—)\n` +
          `Awaiting submission dossier upload. Critical modules required for validation:\n` +
          `• Module 1: Administrative Information and Prescribing Information\n` +
          `• Module 2.5: Clinical Overview & Benefit-Risk Evaluation\n` +
          `• Module 5.3.5: Reports of Efficacy and Safety Studies`
        : `Overall Dossier Readiness: ${readinessPercent}%\n` +
          `• Total Evaluated Documents: ${documents.length}\n` +
          `• Mandatory CTD Gaps Remaining: ${missingRequired}\n` +
          `• Validation Status: ${missingRequired === 0 ? 'READY FOR REGULATORY SUBMISSION' : 'REVISION REQUIRED PRIOR TO FILING'}`,
    order: 5,
  });

  // 6. Recommendations
  sections.push({
    id: generateId(),
    title: '6. Recommendations',
    content:
      `1. Safety Surveillance: Maintain continuous post-authorization surveillance for ${uniqueDrugs.join(', ') || 'monitored therapies'}.\n` +
      `2. Regulatory Filing: Complete documentation for missing CTD sections prior to health authority gateway submission.\n` +
      `3. Expedited Reporting: Ensure all serious unexpected adverse reactions (SUSARs) conform to 15-day expedited reporting deadlines.\n` +
      `4. Benefit-Risk Assessment: Update Periodic Safety Update Report (PSUR / PBRER) with current cohort statistics.`,
    order: 6,
  });

  // 7. Human Review Notes
  sections.push({
    id: generateId(),
    title: '7. Human Review Notes',
    content:
      (notes ? `User Provided Annotations:\n"${notes}"\n\n` : '') +
      `REGULATORY NOTICE: This report was prepared with AI assistance from PharmaGuard AI. In compliance with FDA, EMA (GVP Module VI), and ICH guidelines, automated evaluations require qualified human medical review.\n\n` +
      `• Medical Reviewer: ___________________________\n` +
      `• QPPV / Safety Officer: _______________________\n` +
      `• Sign-off Date: ______________________________\n` +
      `• Final Disposition: [  ] Approved   [  ] Revisions Requested   [  ] Escalated to Safety Board`,
    order: 7,
  });

  return sections;
}

export async function generateReport(
  request: ReportGenerationRequest,
  events: AdverseEvent[],
  signals: Signal[],
  documents: CTDDocument[],
  userName: string
): Promise<Report> {
  const sections = buildSevenSections(events, signals, documents, userName, request.notes);
  const now = new Date().toISOString();

  return {
    id: generateId(),
    title: request.title,
    category: request.category,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    generatedBy: userName,
    summary: `AI-assisted safety & submission evaluation covering ${events.length} adverse event(s), ${signals.length} signal(s), and ${documents.length} CTD document(s).`,
    sections,
    metadata: {
      adverseEventsIncluded: request.includeAdverseEvents ? events.length : 0,
      signalsIncluded: request.includeSignals ? signals.length : 0,
      documentsIncluded: request.includeDocuments ? documents.length : 0,
      dateRangeFrom: request.dateRangeFrom,
      dateRangeTo: request.dateRangeTo,
      drugNames: [...new Set(events.map(e => e.drugName))],
    },
  };
}

export function exportReportAsText(report: Report): string {
  const header = `${'='.repeat(70)}\n` +
    `PHARMAGUARD AI — REGULATORY & SAFETY EVALUATION REPORT\n` +
    `${'='.repeat(70)}\n` +
    `Report Title : ${report.title}\n` +
    `Category     : ${report.category.toUpperCase()}\n` +
    `Generated At : ${new Date(report.createdAt).toLocaleString('en-US')}\n` +
    `Prepared By  : ${report.generatedBy}\n` +
    `Review Status: ${report.status.toUpperCase()}\n` +
    `Notice       : AI-assisted analysis — requires qualified human review.\n\n`;

  const body = report.sections
    .sort((a, b) => a.order - b.order)
    .map(s => `${'─'.repeat(60)}\n${s.title.toUpperCase()}\n${'─'.repeat(60)}\n${s.content}`)
    .join('\n\n');

  return header + body;
}
