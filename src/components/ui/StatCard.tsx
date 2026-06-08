interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'blue' | 'red' | 'amber' | 'purple'
}

const accentColors: Record<string, { bar: string; text: string }> = {
  blue:   { bar: '#2563eb', text: '#2563eb' },
  red:    { bar: '#ef4444', text: '#dc2626' },
  amber:  { bar: '#f59e0b', text: '#d97706' },
  purple: { bar: '#a855f7', text: '#9333ea' },
}

export function StatCard({ label, value, sub, accent = 'blue' }: StatCardProps) {
  const c = accentColors[accent]
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
      <div style={{ width: 32, height: 2, borderRadius: 9999, backgroundColor: c.bar }} />
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>
        <p style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1, color: c.text, marginTop: 4 }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  )
}
