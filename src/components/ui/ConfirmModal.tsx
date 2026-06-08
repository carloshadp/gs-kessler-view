interface ConfirmModalProps {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = true, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={onCancel} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.25)' }} />
      <div style={{
        position: 'relative', backgroundColor: '#fff',
        border: '1px solid #e5e7eb', borderRadius: 12,
        padding: '24px 28px', maxWidth: 380, width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            backgroundColor: danger ? '#fef2f2' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 16, color: danger ? '#dc2626' : '#2563eb' }}>{danger ? '!' : '?'}</span>
          </div>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, paddingTop: 6 }}>{message}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 8, backgroundColor: '#fff', cursor: 'pointer' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer',
              backgroundColor: danger ? '#dc2626' : '#2563eb',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
