import { useAppContext } from '../context/AppContext';
import { runSignalAnalysis } from '../services/signalAnalysis';
import type { Signal } from '../types/signal';
import { useState } from 'react';

export function useSignals() {
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    if (state.adverseEvents.length === 0) {
      setError('Please upload adverse event data before running analysis.');
      return;
    }
    setError(null);
    dispatch({ type: 'SET_ANALYSIS_RUNNING', payload: true });

    // Small timeout to allow UI to show loading state
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const { signals, run } = runSignalAnalysis(state.adverseEvents);
      dispatch({ type: 'SET_SIGNALS', payload: { signals, run } });
    } catch (err) {
      dispatch({ type: 'SET_ANALYSIS_RUNNING', payload: false });
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  }

  function updateSignalStatus(id: string, status: Signal['status'], note?: string) {
    dispatch({ type: 'UPDATE_SIGNAL_STATUS', payload: { id, status, note } });
  }

  return {
    signals: state.signals,
    signalRuns: state.signalRuns,
    isRunning: state.isAnalysisRunning,
    error,
    runAnalysis,
    updateSignalStatus,
  };
}
