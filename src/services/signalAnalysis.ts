import type { AdverseEvent } from '../types/adverseEvent';
import type { Signal, SignalAnalysisRun, DisproportionalityResult } from '../types/signal';
import { generateId } from '../utils/parsers';

// ─── Reporting Odds Ratio (disproportionality) ────────────────────────────────

/**
 * Computes per drug-event pair:
 *   ROR = (a/b) / (c/d)
 * where:
 *   a = events with drug D and event E
 *   b = events with drug D but NOT event E
 *   c = events WITHOUT drug D but WITH event E
 *   d = events WITHOUT drug D and WITHOUT event E
 */
function computeROR(a: number, b: number, c: number, d: number): { ror: number; lower: number; upper: number } {
  if (b === 0 || c === 0 || d === 0) return { ror: 0, lower: 0, upper: 0 };
  const ror = (a * d) / (b * c);
  const lnROR = Math.log(ror);
  const se = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d);
  return {
    ror: parseFloat(ror.toFixed(3)),
    lower: parseFloat(Math.exp(lnROR - 1.96 * se).toFixed(3)),
    upper: parseFloat(Math.exp(lnROR + 1.96 * se).toFixed(3)),
  };
}

/**
 * Simple Information Component approximation.
 * IC = log2(observed / expected)
 */
function computeIC(observed: number, expected: number): number {
  if (expected === 0 || observed === 0) return 0;
  return parseFloat((Math.log2(observed / expected)).toFixed(3));
}

export function runDisproportionalityAnalysis(events: AdverseEvent[]): DisproportionalityResult[] {
  const total = events.length;
  if (total === 0) return [];

  // Build frequency maps
  const drugEventCounts = new Map<string, Map<string, number>>();
  const drugCounts = new Map<string, number>();
  const eventCounts = new Map<string, number>();

  for (const ev of events) {
    const drug = ev.drugName.trim();
    const eventTerm = ev.meddraTermPreferred ?? ev.eventDescription.slice(0, 60).trim();

    drugCounts.set(drug, (drugCounts.get(drug) ?? 0) + 1);
    eventCounts.set(eventTerm, (eventCounts.get(eventTerm) ?? 0) + 1);

    if (!drugEventCounts.has(drug)) drugEventCounts.set(drug, new Map());
    const eMap = drugEventCounts.get(drug)!;
    eMap.set(eventTerm, (eMap.get(eventTerm) ?? 0) + 1);
  }

  const results: DisproportionalityResult[] = [];

  for (const [drug, eMap] of drugEventCounts.entries()) {
    const totalDrug = drugCounts.get(drug) ?? 0;
    for (const [eventTerm, a] of eMap.entries()) {
      const totalEvent = eventCounts.get(eventTerm) ?? 0;
      const b = totalDrug - a;
      const c = totalEvent - a;
      const d = total - totalDrug - c;
      const expected = parseFloat(((totalDrug * totalEvent) / total).toFixed(3));
      const { ror, lower, upper } = computeROR(a, b, c, d);
      const ic = computeIC(a, expected);
      const isSignal = ror > 2 && lower > 1 && a >= 3;

      results.push({
        drugName: drug,
        eventTerm,
        observed: a,
        expected,
        ror,
        ror95Lower: lower,
        ror95Upper: upper,
        ic,
        ebgm: 0, // simplified — full EBGM requires Bayesian prior
        isSignal,
      });
    }
  }

  return results.filter(r => r.observed > 0).sort((a, b) => b.ror - a.ror);
}

// ─── Signal strength / priority helpers ──────────────────────────────────────

function toStrength(ror: number): Signal['strength'] {
  if (ror >= 5) return 'strong';
  if (ror >= 2) return 'moderate';
  return 'weak';
}

function toPriority(ror: number, caseCount: number, hasSerious: boolean): Signal['priority'] {
  if (hasSerious && ror >= 5 && caseCount >= 5) return 'critical';
  if (ror >= 4 || (hasSerious && caseCount >= 3)) return 'high';
  if (ror >= 2) return 'medium';
  return 'low';
}

// ─── Build signals from results ───────────────────────────────────────────────

export function buildSignals(
  results: DisproportionalityResult[],
  events: AdverseEvent[]
): Signal[] {
  const seriousSet = new Set(events.filter(e => e.seriousness).map(e => e.drugName));

  return results
    .filter(r => r.isSignal)
    .map(r => {
      const relatedEventIds = events
        .filter(e => e.drugName === r.drugName &&
          (e.meddraTermPreferred === r.eventTerm || e.eventDescription.startsWith(r.eventTerm)))
        .map(e => e.id);

      const now = new Date().toISOString();
      const hasSerious = seriousSet.has(r.drugName);

      const seriousCount = events.filter(e => e.drugName === r.drugName &&
        (e.meddraTermPreferred === r.eventTerm || e.eventDescription.startsWith(r.eventTerm)) &&
        e.seriousness).length;

      return {
        id: generateId(),
        drugName: r.drugName,
        eventTerm: r.eventTerm,
        reportingOddsRatio: r.ror,
        ror95CiLower: r.ror95Lower,
        ror95CiUpper: r.ror95Upper,
        proportionalReportingRatio: parseFloat((r.ror * 0.95).toFixed(2)),
        seriousCount,
        trend: 'stable' as const,
        informationComponent: r.ic,
        caseCount: r.observed,
        expectedCount: r.expected,
        strength: toStrength(r.ror),
        priority: toPriority(r.ror, r.observed, hasSerious),
        status: 'new',
        detectedAt: now,
        lastUpdatedAt: now,
        relatedEventIds,
      };
    });
}

// ─── Main run function ────────────────────────────────────────────────────────

export function runSignalAnalysis(events: AdverseEvent[]): { signals: Signal[]; run: SignalAnalysisRun } {
  const dispResults = runDisproportionalityAnalysis(events);
  const signals = buildSignals(dispResults, events);

  const run: SignalAnalysisRun = {
    id: generateId(),
    runAt: new Date().toISOString(),
    totalSignals: signals.length,
    newSignals: signals.filter(s => s.status === 'new').length,
    criticalSignals: signals.filter(s => s.priority === 'critical').length,
    eventsAnalyzed: events.length,
    method: 'disproportionality',
  };

  return { signals, run };
}
