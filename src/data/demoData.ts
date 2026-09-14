import type { AdverseEvent } from '../types/adverseEvent';

/**
 * Fictional Patient Demo Dataset
 * 
 * IMPORTANT:
 * - Represents ONLY ONE fictional patient for demonstration purposes.
 * - Never contains real patient identifying information.
 * - Never represents real clinical evidence.
 * - Clearly isolated with `isDemo: true`.
 */

export interface FictionalPatient {
  patientId: string;
  age: number;
  sex: string;
  country: string;
  drug: string;
  dose: string;
  indication: string;
  disclaimer: string;
}

export const DEMO_PATIENT: FictionalPatient = {
  patientId: 'DEMO-001',
  age: 45,
  sex: 'Male',
  country: 'India',
  drug: 'DemoDrug-100',
  dose: '50 mg once daily',
  indication: 'Hypertension',
  disclaimer: 'Fictional patient — for demonstration only. Not a real person or real clinical case.',
};

export const DEMO_ADVERSE_EVENTS: AdverseEvent[] = [
  {
    id: 'demo-ae-001',
    reportId: 'CASE-DEMO-001',
    patientId: 'DEMO-001',
    drugName: 'DemoDrug-100',
    eventDescription: 'Headache',
    meddraTermPreferred: 'Headache (10019211)',
    severity: 'mild',
    seriousness: false,
    outcome: 'recovered',
    causality: 'possible',
    reportType: 'healthcare-professional',
    reportDate: '2024-03-05',
    onsetDate: '2024-03-01',
    patientAge: 45,
    patientSex: 'male',
    countryOfOccurrence: 'India',
    indication: 'Hypertension',
    dose: '50 mg once daily',
    status: 'closed',
    entryMethod: 'manual',
    isDemo: true,
    uploadedAt: '2024-03-05T10:00:00.000Z',
    narrativeSummary: '45-year-old male on DemoDrug-100 50mg daily reported mild frontal headache. Resolved without sequelae.',
  },
  {
    id: 'demo-ae-002',
    reportId: 'CASE-DEMO-002',
    patientId: 'DEMO-001',
    drugName: 'DemoDrug-100',
    eventDescription: 'Dizziness',
    meddraTermPreferred: 'Dizziness (10013573)',
    severity: 'moderate',
    seriousness: false,
    outcome: 'recovering',
    causality: 'possible',
    reportType: 'healthcare-professional',
    reportDate: '2024-03-14',
    onsetDate: '2024-03-12',
    patientAge: 45,
    patientSex: 'male',
    countryOfOccurrence: 'India',
    indication: 'Hypertension',
    dose: '50 mg once daily',
    status: 'under-review',
    entryMethod: 'manual',
    isDemo: true,
    uploadedAt: '2024-03-14T11:30:00.000Z',
    narrativeSummary: 'Same patient reported transient postural lightheadedness/dizziness 10 days later. Under clinical observation; recovering.',
  },
  {
    id: 'demo-ae-003',
    reportId: 'CASE-DEMO-003',
    patientId: 'DEMO-001',
    drugName: 'DemoDrug-100',
    eventDescription: 'Nausea',
    meddraTermPreferred: 'Nausea (10028813)',
    severity: 'mild',
    seriousness: false,
    outcome: 'recovered',
    causality: 'possible',
    reportType: 'consumer',
    reportDate: '2024-03-22',
    onsetDate: '2024-03-20',
    patientAge: 45,
    patientSex: 'male',
    countryOfOccurrence: 'India',
    indication: 'Hypertension',
    dose: '50 mg once daily',
    status: 'closed',
    entryMethod: 'manual',
    isDemo: true,
    uploadedAt: '2024-03-22T09:15:00.000Z',
    narrativeSummary: 'Mild morning nausea lasting 2 days after taking medication with water instead of food. Resolved upon taking with meals.',
  },
];
