import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className = '', id, ...rest }: InputProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <div className={icon ? 'input-with-icon' : ''}>
        {icon && <span className="input-icon">{icon}</span>}
        <input id={id} className={`input ${className}`} {...rest} />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
}

export function Select({ label, options, error, className = '', id, ...rest }: SelectProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <select id={id} className={`input ${className}`} {...rest}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', id, ...rest }: TextareaProps) {
  return (
    <div className="input-group">
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <textarea id={id} className={`input ${className}`} style={{ minHeight: 90, resize: 'vertical' }} {...rest} />
    </div>
  );
}

export default Input;
