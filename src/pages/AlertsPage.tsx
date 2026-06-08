import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { alertApi } from '../api/alertApi'
import { debrisApi } from '../api/debrisApi'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import type { CollisionAlertRequest, AlertSeverity } from '../types'

const SEVERITIES: AlertSeverity[] = ['CATASTROPHIC', 'CRITICAL', 'WARNING', 'INFO']
const emptyForm: CollisionAlertRequest = { primaryDebrisId: 0, secondaryObjectId: '', secondaryObjectName: '', collisionProbability: 0, estimatedTimeToEvent: null, severity: 'WARNING' }
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'
const selectCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

const severityDotColor: Record<string, string> = {
  CATASTROPHIC: '#dc2626', CRITICAL: '#ef4444',
  WARNING: '#f59e0b', INFO: '#60a5fa',
}

export function AlertsPage() {
  const toast = useToast()
  const [onlyActive, setOnlyActive] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | ''>('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState<CollisionAlertRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data: alerts, loading, error, reload } = useApi(
    () => onlyActive ? alertApi.getActive() : alertApi.getAll(filterSeverity as AlertSeverity || undefined),
    [onlyActive, filterSeverity]
  )
  const { data: allDebris } = useApi(() => debrisApi.getAll())

  async function handleAcknowledge(id: number) {
    try { await alertApi.acknowledge(id); toast.success('Alerta reconhecido.'); reload() }
    catch { toast.error('Erro ao reconhecer alerta.') }
  }
  async function handleDelete(id: number) {
    try { await alertApi.delete(id); toast.success('Alerta removido.'); reload() }
    catch { toast.error('Erro ao remover alerta.') }
    finally { setConfirmDelete(null) }
  }
  async function handleSave() {
    setSaving(true)
    try { await alertApi.create(form); toast.success('Alerta registrado com sucesso.'); setModal(false); reload() }
    catch { toast.error('Erro ao registrar alerta.') } finally { setSaving(false) }
  }

  const f = (field: keyof CollisionAlertRequest, value: unknown) => setForm(p => ({ ...p, [field]: value }))
  const unacknowledged = alerts?.filter(a => !a.acknowledged).length ?? 0

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Monitoramento</p>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>Collision<br />Alerts</h1>
          <p style={{ marginTop: 10, fontSize: 14 }}>
            {unacknowledged > 0
              ? <span style={{ color: '#dc2626', fontWeight: 600 }}>{unacknowledged} alerta{unacknowledged !== 1 ? 's' : ''} não reconhecido{unacknowledged !== 1 ? 's' : ''}</span>
              : <span style={{ color: '#6b7280' }}>Todos os alertas reconhecidos</span>
            }
          </p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModal(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          <span>+</span> Novo Alerta
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          onClick={() => setOnlyActive(v => !v)}
          style={{
            padding: '8px 14px', fontSize: 13, fontWeight: 500, borderRadius: 8, cursor: 'pointer',
            backgroundColor: onlyActive ? '#2563eb' : '#fff',
            color: onlyActive ? '#fff' : '#374151',
            border: onlyActive ? '1px solid #2563eb' : '1px solid #e5e7eb',
          }}
        >
          {onlyActive ? '● Apenas ativos' : '○ Apenas ativos'}
        </button>
        {!onlyActive && (
          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value as AlertSeverity | '')}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas as severidades</option>
            {SEVERITIES.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '40px 0' }}>Carregando...</p>}
      {error && <p style={{ textAlign: 'center', color: '#ef4444', fontSize: 13, padding: '40px 0' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!loading && alerts?.map(a => (
          <div
            key={a.id}
            style={{
              backgroundColor: '#fff',
              border: `1px solid ${a.acknowledged ? '#f3f4f6' : '#e5e7eb'}`,
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: a.acknowledged ? 0.6 : 1,
            }}
          >
            <div
              className={!a.acknowledged ? 'animate-pulse' : ''}
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                backgroundColor: a.acknowledged ? '#d1d5db' : (severityDotColor[a.severity] ?? '#9ca3af'),
              }}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{a.primaryDebrisName}</span>
                <span style={{ color: '#d1d5db', fontSize: 12 }}>×</span>
                <span style={{ color: '#374151', fontSize: 13 }}>{a.secondaryObjectName}</span>
                <Badge value={a.severity} />
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#9ca3af' }}>
                  P = {(a.collisionProbability * 100).toFixed(4)}%
                </span>
                {a.estimatedTimeToEvent && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    Estimativa: {new Date(a.estimatedTimeToEvent).toLocaleDateString('pt-BR')}
                  </span>
                )}
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#d1d5db' }}>
                  {a.primaryDebrisNoradId} × {a.secondaryObjectId}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {!a.acknowledged ? (
                <button
                  onClick={() => handleAcknowledge(a.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Reconhecer
                </button>
              ) : (
                <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ Reconhecido
                </span>
              )}
              <button
                onClick={() => setConfirmDelete(a.id)}
                className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {!loading && alerts?.length === 0 && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum alerta encontrado</p>
          </div>
        )}
      </div>

      {confirmDelete !== null && (
        <ConfirmModal
          message="Tem certeza que deseja remover este alerta?"
          confirmLabel="Remover"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {modal && (
        <Modal title="Registrar Alerta de Colisão" onClose={() => setModal(false)}>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Detrito Primário *</label>
              <select value={form.primaryDebrisId} onChange={e => f('primaryDebrisId', +e.target.value)} className={selectCls}>
                <option value={0}>Selecione...</option>
                {allDebris?.map(d => <option key={d.id} value={d.id}>{d.name} (NORAD {d.noradId})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>ID Objeto Secundário *</label><input value={form.secondaryObjectId} onChange={e => f('secondaryObjectId', e.target.value)} placeholder="ex: 22675" className={inputCls} /></div>
              <div><label className={labelCls}>Nome Objeto Secundário *</label><input value={form.secondaryObjectName} onChange={e => f('secondaryObjectName', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Probabilidade (0–1) *</label><input type="number" step="0.0001" min="0" max="1" value={form.collisionProbability} onChange={e => f('collisionProbability', +e.target.value)} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Severidade</label>
                <select value={form.severity} onChange={e => f('severity', e.target.value)} className={selectCls}>
                  {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Tempo Estimado</label><input type="datetime-local" value={form.estimatedTimeToEvent ?? ''} onChange={e => f('estimatedTimeToEvent', e.target.value || null)} className={inputCls} /></div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
                {saving ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
