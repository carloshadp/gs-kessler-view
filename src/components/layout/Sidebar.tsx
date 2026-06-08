import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', icon: '○', desc: 'Dashboard' },
  { to: '/debris', label: 'Debris Catalog', icon: '◈', desc: 'Objetos orbitais' },
  { to: '/missions', label: 'Missions', icon: '◎', desc: 'Mitigação' },
  { to: '/alerts', label: 'Alerts', icon: '△', desc: 'Colisões' },
  { to: '/nasa', label: 'NASA DONKI', icon: '☀', desc: 'CME events' },
]

export function Sidebar() {
  return (
    <aside
      style={{
        width: 224,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflowY: 'auto',
        borderRight: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 6,
              backgroundColor: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ color: 'white', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>K</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1 }}>Kessler OS</p>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, lineHeight: 1 }}>Orbital Monitor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px 10px' }}>
          Navigation
        </p>
        {links.map(({ to, label, icon, desc }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 11, width: 14, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: 10, opacity: isActive ? 0.75 : 1, color: isActive ? 'inherit' : '#9ca3af', lineHeight: 1, marginTop: 2 }}>{desc}</p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System status */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 500 }}>Sistema operacional</span>
        </div>
        <p style={{ fontSize: 10, color: '#d1d5db' }}>FIAP · Global Solution 2026.1</p>
        <p style={{ fontSize: 10, color: '#d1d5db', marginTop: 1 }}>SOA — Kessler OS</p>
      </div>
    </aside>
  )
}
