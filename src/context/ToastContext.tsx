import { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
})

const typeStyles: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '✓' },
  error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', icon: '✕' },
  warning: { bg: '#fffbeb', border: '#fde68a', color: '#b45309', icon: '!' },
  info:    { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: 'i' },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((message: string, type: ToastType) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const ctx: ToastContextValue = {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    warning: (msg) => show(msg, 'warning'),
    info:    (msg) => show(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const s = typeStyles[t.type]
          return (
            <div
              key={t.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                backgroundColor: s.bg, border: `1px solid ${s.border}`,
                borderRadius: 10, padding: '12px 16px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: 260, maxWidth: 380,
                animation: 'toast-in 0.2s ease',
                pointerEvents: 'auto',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                backgroundColor: s.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {s.icon}
              </span>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', lineHeight: 1.4 }}>{t.message}</p>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
