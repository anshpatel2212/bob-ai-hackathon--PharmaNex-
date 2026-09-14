import { useAppContext } from '../context/AppContext';
import { uploadAdverseEvents } from '../services/adverseEvents';
import type { AdverseEventFilters } from '../types/adverseEvent';
import { defaultFilters } from '../types/adverseEvent';
import { useState } from 'react';

export function useAdverseEvents() {
  const { state, dispatch } = useAppContext();
  const [filters, setFilters] = useState<AdverseEventFilters>(defaultFilters);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(file: File): Promise<{ success: boolean; count: number; message: string }> {
    setIsUploading(true);
    setUploadError(null);
    try {
      const { result, upload } = await uploadAdverseEvents(file);
      if (result.events.length === 0) {
        const msg = result.errors.length > 0
          ? result.errors[0].message
          : 'No valid adverse event records found in file. Please ensure columns include Drug Name and Adverse Event.';
        setUploadError(msg);
        return { success: false, count: 0, message: msg };
      } else {
        dispatch({ type: 'ADD_ADVERSE_EVENTS', payload: { events: result.events, upload } });
        return { success: true, count: result.events.length, message: `Successfully loaded ${result.events.length} records.` };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
      return { success: false, count: 0, message: msg };
    } finally {
      setIsUploading(false);
    }
  }

  function clearAll() {
    dispatch({ type: 'CLEAR_ADVERSE_EVENTS' });
    setFilters(defaultFilters);
  }

  return {
    events: state.adverseEvents,
    uploadHistory: state.aeUploadHistory,
    filters,
    setFilters,
    isUploading,
    uploadError,
    handleUpload,
    clearAll,
  };
}
