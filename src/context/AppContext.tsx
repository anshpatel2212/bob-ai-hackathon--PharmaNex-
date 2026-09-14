import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AdverseEvent, AdverseEventUpload } from '../types/adverseEvent';
import type { Signal, SignalAnalysisRun } from '../types/signal';
import type { CTDDocument } from '../types/document';
import type { Report } from '../types/report';
import { DEMO_ADVERSE_EVENTS } from '../data/demoData';

// ─── State ───────────────────────────────────────────────────────────────────

export interface AppState {
  adverseEvents: AdverseEvent[];
  aeUploadHistory: AdverseEventUpload[];
  signals: Signal[];
  signalRuns: SignalAnalysisRun[];
  documents: CTDDocument[];
  reports: Report[];
  isAnalysisRunning: boolean;
  theme: 'dark' | 'light';
  userName: string;
}

const initialState: AppState = {
  adverseEvents: [...DEMO_ADVERSE_EVENTS],
  aeUploadHistory: [],
  signals: [],
  signalRuns: [],
  documents: [],
  reports: [],
  isAnalysisRunning: false,
  theme: 'dark',
  userName: 'Pharmacovigilance Team',
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type AppAction =
  | { type: 'ADD_ADVERSE_EVENTS'; payload: { events: AdverseEvent[]; upload: AdverseEventUpload } }
  | { type: 'CLEAR_ADVERSE_EVENTS' }
  | { type: 'CLEAR_DEMO_DATA' }
  | { type: 'LOAD_DEMO_DATA' }
  | { type: 'SET_SIGNALS'; payload: { signals: Signal[]; run: SignalAnalysisRun } }
  | { type: 'UPDATE_SIGNAL_STATUS'; payload: { id: string; status: Signal['status']; note?: string } }
  | { type: 'UPDATE_ADVERSE_EVENT'; payload: AdverseEvent }
  | { type: 'DELETE_ADVERSE_EVENT'; payload: string }
  | { type: 'ADD_DOCUMENTS'; payload: CTDDocument[] }
  | { type: 'REMOVE_DOCUMENT'; payload: string }
  | { type: 'UPDATE_DOCUMENT_STATUS'; payload: { id: string; status: CTDDocument['status'] } }
  | { type: 'ADD_REPORT'; payload: Report }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'DELETE_REPORT'; payload: string }
  | { type: 'SET_ANALYSIS_RUNNING'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'RESET_ALL' };

const STORAGE_KEY = 'pharmaguard_state_v1';

function loadInitialState(): AppState {
  if (typeof window === 'undefined') return initialState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...initialState,
        ...parsed,
        isAnalysisRunning: false,
      };
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage', e);
  }
  return initialState;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_ADVERSE_EVENTS':
      return {
        ...state,
        adverseEvents: [...state.adverseEvents, ...action.payload.events],
        aeUploadHistory: [...state.aeUploadHistory, action.payload.upload],
      };

    case 'CLEAR_ADVERSE_EVENTS':
      return {
        ...state,
        adverseEvents: [],
        aeUploadHistory: [],
        signals: [],
        signalRuns: [],
      };

    case 'CLEAR_DEMO_DATA':
      return {
        ...state,
        adverseEvents: state.adverseEvents.filter(
          e => !e.isDemo && e.patientId !== 'DEMO-001' && !e.reportId.startsWith('CASE-DEMO')
        ),
        signals: state.signals.filter(s => s.drugName !== 'DemoDrug-100'),
        reports: state.reports.filter(r => !r.title.includes('DEMO-001') && !r.title.includes('DemoDrug-100')),
      };

    case 'LOAD_DEMO_DATA':
      return {
        ...state,
        adverseEvents: [
          ...state.adverseEvents.filter(
            e => !e.isDemo && e.patientId !== 'DEMO-001' && !e.reportId.startsWith('CASE-DEMO')
          ),
          ...DEMO_ADVERSE_EVENTS,
        ],
      };

    case 'SET_SIGNALS':
      return {
        ...state,
        signals: action.payload.signals,
        signalRuns: [...state.signalRuns, action.payload.run],
        isAnalysisRunning: false,
      };

    case 'UPDATE_SIGNAL_STATUS':
      return {
        ...state,
        signals: state.signals.map(s =>
          s.id === action.payload.id
            ? { ...s, status: action.payload.status, reviewNote: action.payload.note ?? s.reviewNote, lastUpdatedAt: new Date().toISOString() }
            : s
        ),
      };

    case 'UPDATE_ADVERSE_EVENT':
      return {
        ...state,
        adverseEvents: state.adverseEvents.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_ADVERSE_EVENT':
      return {
        ...state,
        adverseEvents: state.adverseEvents.filter(e => e.id !== action.payload),
      };

    case 'ADD_DOCUMENTS':
      return {
        ...state,
        documents: [...state.documents, ...action.payload],
      };

    case 'REMOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.filter(d => d.id !== action.payload),
      };

    case 'UPDATE_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map(d =>
          d.id === action.payload.id ? { ...d, status: action.payload.status } : d
        ),
      };

    case 'ADD_REPORT':
      return { ...state, reports: [action.payload, ...state.reports] };

    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(r => r.id === action.payload.id ? action.payload : r),
      };

    case 'DELETE_REPORT':
      return { ...state, reports: state.reports.filter(r => r.id !== action.payload) };

    case 'SET_ANALYSIS_RUNNING':
      return { ...state, isAnalysisRunning: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'SET_USER_NAME':
      return { ...state, userName: action.payload };

    case 'RESET_ALL':
      return {
        adverseEvents: [],
        aeUploadHistory: [],
        signals: [],
        signalRuns: [],
        documents: [],
        reports: [],
        isAnalysisRunning: false,
        theme: state.theme,
        userName: state.userName,
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// oxlint-disable-next-line react-refresh/only-export-components, react/only-export-components
export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
