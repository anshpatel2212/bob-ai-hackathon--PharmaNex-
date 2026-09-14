
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  dot?: boolean;
}

function dot(variant: BadgeVariant) {
  const colors: Record<BadgeVariant, string> = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger:  'var(--danger)',
    info:    'var(--info)',
    neutral: 'var(--text-tertiary)',
    accent:  'var(--accent)',
  };
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: colors[variant], flexShrink: 0,
      display: 'inline-block',
    }} />
  );
}

export default function StatusBadge({ variant, label, dot: showDot }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      {showDot && dot(variant)}
      {label}
    </span>
  );
}
