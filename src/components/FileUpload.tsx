import { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: string;
  description?: string;
  formats?: string[];
  loading?: boolean;
  disabled?: boolean;
  maxSizeMB?: number;
  id?: string;
}

export default function FileUpload({
  onFiles,
  accept,
  multiple = false,
  title = 'Drop files here or click to upload',
  description = 'Select a file from your computer.',
  formats,
  loading,
  disabled,
  maxSizeMB = 50,
  id = 'file-upload',
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSizeError(null);

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setSizeError(`${file.name} exceeds the ${maxSizeMB} MB limit.`);
        return;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      onFiles(validFiles);
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div>
      <div
        className={`file-upload-zone ${dragging ? 'dragging' : ''} ${disabled ? 'opacity-60' : ''}`}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !disabled && !loading && inputRef.current?.click()}
        style={{ cursor: disabled || loading ? 'not-allowed' : 'pointer' }}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
          disabled={disabled || loading}
        />

        <div className="file-upload-icon">
          {loading
            ? <svg className="animate-spin" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeLinecap="round" /></svg>
            : <Upload size={22} />
          }
        </div>

        <div className="file-upload-title">{loading ? 'Processing…' : title}</div>
        <div className="file-upload-description">{description}</div>

        {formats && formats.length > 0 && (
          <div className="file-upload-formats">
            {formats.map(f => (
              <span key={f} className="file-format-badge">{f}</span>
            ))}
          </div>
        )}
      </div>

      {sizeError && (
        <div className="alert alert--error mt-sm">
          <FileText size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {sizeError}
        </div>
      )}
    </div>
  );
}
