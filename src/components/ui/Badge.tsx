interface BadgeProps {
  value: string
  className?: string
}

const styles: Record<string, { bg: string; color: string; border: string }> = {
  CRITICAL:      { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  CATASTROPHIC:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  URGENT:        { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  HIGH:          { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  MEDIUM:        { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  WARNING:       { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  LOW:           { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  INFO:          { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  ACTIVE:        { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  MONITORING:    { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
  DECAYED:       { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
  REMOVED:       { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
  PLANNED:       { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd' },
  IN_PROGRESS:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  COMPLETED:     { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  CANCELLED:     { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
  DEBRIS:        { bg: '#f9fafb', color: '#374151', border: '#e5e7eb' },
  ROCKET_BODY:   { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  PAYLOAD:       { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  UNKNOWN:       { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
}

const defaultStyle = { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' }

export function Badge({ value, className = '' }: BadgeProps) {
  const s = styles[value] ?? defaultStyle
  return (
    <span
      className={`inline-flex items-center rounded font-semibold tracking-wide ${className}`}
      style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        fontSize: '11px',
        padding: '1px 6px',
      }}
    >
      {value.replace(/_/g, ' ')}
    </span>
  )
}
