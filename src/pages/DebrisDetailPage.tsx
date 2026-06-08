import { useParams, useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { debrisApi } from '../api/debrisApi'
import { missionApi } from '../api/missionApi'
import { Badge } from '../components/ui/Badge'

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{value ?? '—'}</p>
    </div>
  )
}

function MetricCard({ label, value, sub, color = '#2563eb' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 20px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

export function DebrisDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: debris, loading, error } = useApi(() => debrisApi.getById(Number(id)), [id])
  const { data: missions } = useApi(() => missionApi.getAll(), [])

  const relatedMissions = missions?.filter(m => m.targetDebrisId === Number(id)) ?? []

  if (loading) return (
    <div style={{ padding: '32px 40px' }}>
      <p style={{ color: '#9ca3af', fontSize: 14 }}>Carregando...</p>
    </div>
  )

  if (error || !debris) return (
    <div style={{ padding: '32px 40px' }}>
      <p style={{ color: '#ef4444', fontSize: 14 }}>Detrito não encontrado.</p>
      <button onClick={() => navigate('/debris')} style={{ marginTop: 12, fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}>← Voltar ao catálogo</button>
    </div>
  )

  const riskColor: Record<string, string> = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#16a34a' }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000 }}>

      {/* Back */}
      <button
        onClick={() => navigate('/debris')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0 }}
      >
        ← Voltar ao catálogo
      </button>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>NORAD {debris.noradId}</p>
              <Badge value={debris.riskLevel} />
              <Badge value={debris.status} />
            </div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>{debris.name}</h1>
            <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
              Registrado em {new Date(debris.discoveredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <Badge value={debris.type} />
        </div>
      </div>

      {/* Orbital metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <MetricCard
          label="Período orbital"
          value={`${debris.orbitalPeriodMinutes.toFixed(2)} min`}
          sub="Calculado via 3ª Lei de Kepler"
          color="#2563eb"
        />
        <MetricCard
          label="Altitude"
          value={`${debris.altitudeKm} km`}
          sub="Acima da superfície terrestre"
          color="#7c3aed"
        />
        <MetricCard
          label="Inclinação"
          value={`${debris.inclinationDeg}°`}
          sub="Em relação ao equador"
          color="#0891b2"
        />
        <MetricCard
          label="Nível de risco"
          value={debris.riskLevel}
          sub="Classificação de perigo"
          color={riskColor[debris.riskLevel] ?? '#6b7280'}
        />
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Parâmetros Orbitais</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoRow label="Excentricidade" value={<span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{debris.eccentricity}</span>} />
            <InfoRow label="Altitude" value={<span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{debris.altitudeKm} km</span>} />
            <InfoRow label="Inclinação" value={<span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{debris.inclinationDeg}°</span>} />
            <InfoRow label="Período" value={<span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{debris.orbitalPeriodMinutes.toFixed(4)} min</span>} />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Características Físicas</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <InfoRow label="Tamanho estimado" value={debris.sizeCm != null ? `${debris.sizeCm} cm` : null} />
            <InfoRow label="Massa estimada" value={debris.massKg != null ? `${debris.massKg} kg` : null} />
            <InfoRow label="Tipo" value={<Badge value={debris.type} />} />
            <InfoRow label="Data de lançamento" value={debris.launchDate ? new Date(debris.launchDate).toLocaleDateString('pt-BR') : null} />
          </div>
        </div>
      </div>

      {/* Kepler formula explanation */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>Cálculo do Período Orbital — 3ª Lei de Kepler</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#1e40af' }}>
          T = 2π × √(a³ / μ) / 60 &nbsp;|&nbsp; a = R⊕ + h = 6371 + {debris.altitudeKm} km &nbsp;|&nbsp; μ = 398600.4418 km³/s²
        </p>
        <p style={{ fontSize: 12, color: '#3b82f6', marginTop: 6 }}>
          Resultado: <strong>{debris.orbitalPeriodMinutes.toFixed(4)} minutos</strong> ≈ {(debris.orbitalPeriodMinutes / 60).toFixed(2)} horas por órbita
        </p>
      </div>

      {/* Related missions */}
      {relatedMissions.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Missões de Mitigação</p>
            <p style={{ fontWeight: 700, color: '#111827', marginTop: 2, fontSize: 14 }}>{relatedMissions.length} missão(ões) associada(s)</p>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {relatedMissions.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827', fontSize: 13 }}>{m.name}</td>
                  <td style={{ padding: '12px 20px' }}><Badge value={m.priority} /></td>
                  <td style={{ padding: '12px 20px' }}><Badge value={m.status} /></td>
                  <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: 12 }}>{m.scheduledDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
