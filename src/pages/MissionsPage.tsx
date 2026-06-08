import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { missionApi } from '../api/missionApi'
import { debrisApi } from '../api/debrisApi'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useToast } from '../context/ToastContext'
import type { Mission, MissionRequest, MissionStatus, MissionPriority } from '../types'

const STATUSES: MissionStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
const PRIORITIES: MissionPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW']

const emptyForm: MissionRequest = { name: '', description: '', targetDebrisId: 0, priority: 'MEDIUM', status: 'PLANNED', scheduledDate: '' }
const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'
const selectCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export function MissionsPage() {
  const toast = useToast()
  const [filterStatus, setFilterStatus] = useState<MissionStatus | ''>('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Mission | null>(null)
  const [form, setForm] = useState<MissionRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data: missions, loading, error, reload } = useApi(
    () => missionApi.getAll(filterStatus as MissionStatus || undefined), [filterStatus]
  )
  const { data: allDebris } = useApi(() => debrisApi.getAll())

  function openCreate() { setForm(emptyForm); setEditing(null); setModal('create') }
  function openEdit(m: Mission) {
    setForm({ name: m.name, description: m.description ?? '', targetDebrisId: m.targetDebrisId, priority: m.priority, status: m.status, scheduledDate: m.scheduledDate })
    setEditing(m); setModal('edit')
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (modal === 'create') { await missionApi.create(form); toast.success('Missão criada com sucesso.') }
      else if (editing) { await missionApi.update(editing.id, form); toast.success('Missão atualizada com sucesso.') }
      setModal(null); reload()
    } catch {
      toast.error('Erro ao salvar missão.')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: number) {
    try { await missionApi.delete(id); toast.success('Missão removida.'); reload() }
    catch { toast.error('Erro ao remover missão.') }
    finally { setConfirmDelete(null) }
  }

  const f = (field: keyof MissionRequest, value: unknown) => setForm(p => ({ ...p, [field]: value }))

  return (
    <div style={{ padding: '32px 40px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Operações</p>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>Mitigation<br />Missions</h1>
          <p style={{ color: '#6b7280', marginTop: 8, fontSize: 14 }}>{missions?.length ?? 0} missão(ões) no sistema</p>
        </div>
        <button
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#2563eb', color: 'white', fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          <span>+</span> Nova Missão
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as MissionStatus | '')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Todos os status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading && <p style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Carregando...</p>}
        {error && <p style={{ padding: 32, textAlign: 'center', color: '#ef4444', fontSize: 13 }}>{error}</p>}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                  {['Missão', 'Detrito alvo', 'Prioridade', 'Status', 'Data agendada', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 20px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {missions?.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f9fafb' }} className="hover:bg-gray-50 transition-colors group">
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 600, color: '#111827', fontSize: 13 }}>{m.name}</p>
                      {m.description && <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>{m.description}</p>}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ color: '#374151', fontSize: 13 }}>{m.targetDebrisName}</p>
                      <p style={{ color: '#9ca3af', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>NORAD {m.targetDebrisNoradId}</p>
                    </td>
                    <td style={{ padding: '14px 20px' }}><Badge value={m.priority} /></td>
                    <td style={{ padding: '14px 20px' }}><Badge value={m.status} /></td>
                    <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: 12 }}>{m.scheduledDate}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(m)} className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">Editar</button>
                        <button onClick={() => setConfirmDelete(m.id)} className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100 rounded-md hover:bg-red-50 transition-colors">Remover</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {missions?.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Nenhuma missão encontrada</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete !== null && (
        <ConfirmModal
          message="Tem certeza que deseja remover esta missão?"
          confirmLabel="Remover"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Nova Missão de Mitigação' : 'Editar Missão'} onClose={() => setModal(null)}>
          <div className="space-y-4">
            <div><label className={labelCls}>Nome *</label><input value={form.name} onChange={e => f('name', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Descrição</label><textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} /></div>
            <div>
              <label className={labelCls}>Detrito Alvo *</label>
              <select value={form.targetDebrisId} onChange={e => f('targetDebrisId', +e.target.value)} className={selectCls}>
                <option value={0}>Selecione...</option>
                {allDebris?.map(d => <option key={d.id} value={d.id}>{d.name} (NORAD {d.noradId})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Prioridade</label>
                <select value={form.priority} onChange={e => f('priority', e.target.value)} className={selectCls}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)} className={selectCls}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelCls}>Data Agendada *</label><input type="date" value={form.scheduledDate} onChange={e => f('scheduledDate', e.target.value)} className={inputCls} /></div>
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
