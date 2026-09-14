import { useAppContext } from '../context/AppContext';
import { createDocumentFromFile } from '../services/documents';
import { useState } from 'react';

export function useDocuments() {
  const { state, dispatch } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleUpload(files: File[], sectionCode?: string) {
    setIsUploading(true);
    setUploadError(null);
    try {
      const docs = files.map(f => createDocumentFromFile(f, sectionCode));
      dispatch({ type: 'ADD_DOCUMENTS', payload: docs });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  function removeDocument(id: string) {
    dispatch({ type: 'REMOVE_DOCUMENT', payload: id });
  }

  function markComplete(id: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', payload: { id, status: 'complete' } });
  }

  function markIncomplete(id: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', payload: { id, status: 'incomplete' } });
  }

  return {
    documents: state.documents,
    isUploading,
    uploadError,
    handleUpload,
    removeDocument,
    markComplete,
    markIncomplete,
  };
}
