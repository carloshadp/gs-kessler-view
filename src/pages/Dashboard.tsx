import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { debrisApi } from '../api/debrisApi'
import { missionApi } from '../api/missionApi'
import { alertApi } from '../api/alertApi'
import { StatCard } from '../components/ui/StatCard'
import { Badge } from '../components/ui/Badge'

const REFRESH_INTERVAL = 30_000

export function Dashboard() {
  const { data: debris, reload: reloadDebris } = useApi(() => debrisApi.getAll())
  const { data: missions, reload: reloadMissions } = useApi(() => missionApi.getAll())
  const { data: alerts, reload: reloadAlerts } = useApi(() => alertApi.getActive())
  const { data: critical, reload: reloadCritical } = useApi(() => debrisApi.getCritical())

  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [nextIn, setNextIn] = useState(REFRESH_INTERVAL / 1000)

  useEffect(() => {
    const refresh = setInterval(() => {
      reloadDebris(); reloadMissions(); reloadAlerts(); reloadCritical()
      setLastRefresh(new Date())
      setNextIn(REFRESH_INTERVAL / 1000)
    }, REFRESH_INTERVAL)

    const countdown = setInterval(() => {
      setNextIn(n => Math.max(0, n - 1))
    }, 1000)

    return () => { clearInterval(refresh); clearInterval(countdown) }
  }, [reloadDebris, reloadMissions, reloadAlerts, reloadCritical])

  const totalDebris = debris?.length ?? 0
  const activeAlerts = alerts?.length ?? 0
  const criticalCount = critical?.length ?? 0
  const plannedMissions = missions?.filter(m => m.status === 'PLANNED').length ?? 0

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Kessler OS · Orbital Monitor
          </p>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>
            Debris<br />Tracking
          </h1>
          <p style={{ color: '#6b7280', marginTop: 12, fontSize: 14, maxWidth: 480, lineHeight: 1.6 }}>
            Monitoramento em tempo real de detritos orbitais, missões de mitigação e alertas de colisão em LEO.
          </p>
        </div>
        {/* Auto-refresh indicator */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Auto-refresh ativo</span>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>Próxima atualização em {nextIn}s</p>
          <p style={{ fontSize: 10, color: '#d1d5db', marginTop: 2 }}>
            Última: {lastRefresh.toLocaleTimeString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Objetos rastreados" value={totalDebris} sub="no catálogo NORAD" accent="blue" />
        <StatCard label="Risco crítico" value={criticalCount} sub="ativos em LEO" accent="red" />
        <StatCard label="Alertas ativos" value={activeAlerts} sub="não reconhecidos" accent="amber" />
        <StatCard label="Missões planejadas" value={plannedMissions} sub="aguardando execução" accent="purple" />
      </div>

      {/* Two-col section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 20, marginBottom: 20 }}>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Alertas ativos</p>
              <p style={{ fontWeight: 700, color: '#111827', marginTop: 2, fontSize: 14 }}>{activeAlerts} pendente{activeAlerts !== 1 ? 's' : ''}</p>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: activeAlerts > 0 ? '#ef4444' : '#d1d5db' }} />
          </div>
          <div>
            {alerts?.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Sem alertas ativos</p>
              </div>
            )}
            {alerts?.slice(0, 5).map(a => (
              <div key={a.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#111827', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.primaryDebrisName}</p>
                  <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>× {a.secondaryObjectName}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge value={a.severity} />
                  <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>{(a.collisionProbability * 100).toFixed(3)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Detritos críticos ativos</p>
            <p style={{ fontWeight: 700, color: '#111827', marginTop: 2, fontSize: 14 }}>{criticalCount} objeto{criticalCount !== 1 ? 's' : ''} em monitoramento</p>
          </div>
          <div>
            {critical?.length === 0 && (
              <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum detrito crítico</p>
              </div>
            )}
            {critical?.map(d => (
              <div key={d.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f9fafb', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#fef2f2', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 700 }}>!</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#111827', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
                  <p style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>NORAD {d.noradId} · {d.altitudeKm} km</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <Badge value={d.type} />
                  <p style={{ color: '#9ca3af', fontSize: 11, marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>T = {d.orbitalPeriodMinutes.toFixed(1)} min</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missions table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Missões de mitigação</p>
          <p style={{ fontWeight: 700, color: '#111827', marginTop: 2, fontSize: 14 }}>{missions?.length ?? 0} missão(ões) no sistema</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                {['Missão', 'Detrito alvo', 'Prioridade', 'Status', 'Data agendada'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {missions?.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid #f9fafb' }} className="hover:bg-gray-50 transition-colors">
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827', fontSize: 13 }}>{m.name}</td>
                  <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>{m.targetDebrisName}</td>
                  <td style={{ padding: '12px 20px' }}><Badge value={m.priority} /></td>
                  <td style={{ padding: '12px 20px' }}><Badge value={m.status} /></td>
                  <td style={{ padding: '12px 20px', color: '#6b7280', fontSize: 12 }}>{m.scheduledDate}</td>
                </tr>
              ))}
              {!missions?.length && (
                <tr><td colSpan={5} style={{ padding: '32px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Nenhuma missão</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
