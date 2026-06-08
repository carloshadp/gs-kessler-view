import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { debrisApi } from '../api/debrisApi'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import type { OrbitalDebris, OrbitalDebrisRequest, RiskLevel, DebrisStatus } from '../types'

const RISK_LEVELS: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
const STATUSES: DebrisStatus[] = ['ACTIVE', 'DECAYED', 'REMOVED', 'MONITORING']

const emptyForm: OrbitalDebrisRequest = {
  noradId: '', name: '', type: 'DEBRIS',
  altitudeKm: 0, inclinationDeg: 0, eccentricity: 0,
  sizeCm: null, massKg: null, riskLevel: 'MEDIUM',
  status: 'ACTIVE', launchDate: null,
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-300'
const selectCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export function DebrisPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filterRisk, setFilterRisk] = useState<RiskLevel | ''>('')
  const [filterStatus, setFilterStatus] = useState<DebrisStatus | ''>('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<OrbitalDebris | null>(null)
  const [form, setForm] = useState<OrbitalDebrisRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data, loading, error, reload } = useApi(
    () => debrisApi.getAll({
      ...(filterRisk ? { riskLevel: filterRisk } : {}),
      ...(filterStatus ? { status: filterStatus } : {}),
    }),
    [filterRisk, filterStatus]
  )

  const filtered = useMemo(() => {
    if (!search.trim()) return data ?? []
    const q = search.toLowerCase()
    return (data ?? []).filter(d =>
      d.name.toLowerCase().includes(q) ||
      d.noradId.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q)
    )
  }, [data, search])

  function openCreate() { setForm(emptyForm); setEditing(null); setModal('create') }
  function openEdit(d: OrbitalDebris) {
    setForm({ noradId: d.noradId, name: d.name, type: d.type, altitudeKm: d.altitudeKm, inclinationDeg: d.inclinationDeg, eccentricity: d.eccentricity, sizeCm: d.sizeCm, massKg: d.massKg, riskLevel: d.riskLevel, status: d.status, launchDate: d.launchDate })
    setEditing(d); setModal('edit')
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (modal === 'create') { await debrisApi.create(form); toast.success('Detrito cadastrado com sucesso.') }
      else if (editing) { await debrisApi.update(editing.id, form); toast.success('Detrito atualizado com sucesso.') }
      setModal(null); reload()
    } catch {
      toast.error('Erro ao salvar detrito. Verifique os dados e tente novamente.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try {
      await debrisApi.delete(id)
      toast.success('Detrito removido com sucesso.')
      reload()
    } catch {
      toast.error('Não foi possível remover o detrito.')
    } finally {
      setConfirmDelete(null)
    }
  }

  function exportCsv() {
    if (!filtered.length) return
    const headers = ['NORAD ID', 'Nome', 'Tipo', 'Altitude (km)', 'Inclinação (°)', 'Excentricidade', 'Período (min)', 'Risco', 'Status', 'Lançamento']
    const rows = filtered.map(d => [
      d.noradId, d.name, d.type,
      d.altitudeKm, d.inclinationDeg, d.eccentricity,
      d.orbitalPeriodMinutes.toFixed(4),
      d.riskLevel, d.status, d.launchDate ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'kessler-debris.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.info(`${filtered.length} registros exportados para CSV.`)
  }

  const f = (field: keyof OrbitalDebrisRequest, value: unknown) => setForm(p => ({ ...p, [field]: value }))

  return (
    <div style={{ padding: '32px 40px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Catálogo</p>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>Debris<br />Catalog</h1>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>
            {filtered.length !== (data?.length ?? 0) ? `${filtered.length} de ${data?.length ?? 0}` : `${data?.length ?? 0}`} objetos catalogados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportCsv}
            disabled={!filtered.length}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', backgroundColor: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, borderRadius: 8, border: '1px solid #e5e7eb', cursor: filtered.length ? 'pointer' : 'not-allowed', opacity: filtered.length ? 1 : 0.5 }}
          >
            ↓ Exportar CSV
          </button>
          <button
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            + Novo Detrito
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }}>⌕</span>
          <input
            type="text"
            placeholder="Buscar por nome, NORAD ID, tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 12px 8px 30px', fontSize: 13, color: '#111827', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value as RiskLevel | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500">
          <option value="">Todos os riscos</option>
          {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as DebrisStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500">
          <option value="">Todos os status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        {(filterRisk || filterStatus || search) && (
          <button onClick={() => { setFilterRisk(''); setFilterStatus(''); setSearch('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading && <p style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Carregando...</p>}
        {error && <p style={{ padding: 32, textAlign: 'center', color: '#ef4444', fontSize: 13 }}>{error}</p>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['NORAD ID', 'Nome', 'Tipo', 'Altitude', 'Período', 'Inclinação', 'Risco', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr
                    key={d.id}
                    style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                    className="hover:bg-gray-50 transition-colors group"
                    onClick={() => navigate(`/debris/${d.id}`)}
                  >
                    <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#2563eb', fontWeight: 500 }}>{d.noradId}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: '#111827', fontSize: 13 }}>{d.name}</td>
                    <td style={{ padding: '12px 20px' }}><Badge value={d.type} /></td>
                    <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#374151' }}>{d.altitudeKm} km</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6b7280' }}>{d.orbitalPeriodMinutes.toFixed(1)} min</td>
                    <td style={{ padding: '12px 20px', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#6b7280' }}>{d.inclinationDeg}°</td>
                    <td style={{ padding: '12px 20px' }}><Badge value={d.riskLevel} /></td>
                    <td style={{ padding: '12px 20px' }}><Badge value={d.status} /></td>
                    <td style={{ padding: '12px 20px' }} onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(d)} className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">Editar</button>
                        <button onClick={() => setConfirmDelete(d.id)} className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100 rounded-md hover:bg-red-50 transition-colors">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum detrito encontrado'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete !== null && (
        <ConfirmModal
          message="Tem certeza que deseja remover este detrito? Esta ação não pode ser desfeita."
          confirmLabel="Remover"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Cadastrar Detrito Orbital' : 'Editar Detrito'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>NORAD ID *</label><input value={form.noradId} onChange={e => f('noradId', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Nome *</label><input value={form.name} onChange={e => f('name', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Tipo</label>
                <select value={form.type} onChange={e => f('type', e.target.value)} className={selectCls}>
                  {['DEBRIS', 'ROCKET_BODY', 'PAYLOAD', 'UNKNOWN'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Risco</label>
                <select value={form.riskLevel} onChange={e => f('riskLevel', e.target.value)} className={selectCls}>
                  {RISK_LEVELS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)} className={selectCls}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Altitude (km) *</label><input type="number" value={form.altitudeKm} onChange={e => f('altitudeKm', +e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Inclinação (°) *</label><input type="number" value={form.inclinationDeg} onChange={e => f('inclinationDeg', +e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Excentricidade *</label><input type="number" step="0.0001" value={form.eccentricity} onChange={e => f('eccentricity', +e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Tamanho (cm)</label><input type="number" value={form.sizeCm ?? ''} onChange={e => f('sizeCm', e.target.value ? +e.target.value : null)} className={inputCls} /></div>
              <div><label className={labelCls}>Massa (kg)</label><input type="number" value={form.massKg ?? ''} onChange={e => f('massKg', e.target.value ? +e.target.value : null)} className={inputCls} /></div>
              <div><label className={labelCls}>Lançamento</label><input type="date" value={form.launchDate ?? ''} onChange={e => f('launchDate', e.target.value || null)} className={inputCls} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
