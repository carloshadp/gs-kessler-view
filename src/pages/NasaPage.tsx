import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { nasaApi } from '../api/nasaApi'

const PAGE_SIZE = 8

export function NasaPage() {
  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [page, setPage] = useState(1)

  const { data, loading, error, reload } = useApi(() => nasaApi.getCme(startDate, endDate), [])

  useEffect(() => { setPage(1) }, [data])

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors'

  const total = data?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paginated = data?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? []

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960 }}>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Integração Externa</p>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', lineHeight: 1, letterSpacing: '-0.02em' }}>NASA<br />DONKI</h1>
        <p style={{ color: '#6b7280', marginTop: 12, fontSize: 14, maxWidth: 520, lineHeight: 1.6 }}>
          Eventos de Ejeção de Massa Coronal (CME) podem perturbar satélites e alterar o arrasto em detritos orbitais em LEO.
        </p>
      </div>

      {/* Query bar */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Data Início</p>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Data Fim</p>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
        </div>
        <button
          onClick={reload}
          disabled={loading}
          style={{
            padding: '9px 18px', backgroundColor: loading ? '#93c5fd' : '#2563eb', color: 'white',
            fontSize: 13, fontWeight: 600, borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Consultando...' : 'Consultar NASA'}
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fbbf24' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>API pública NASA DONKI</span>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ color: '#b91c1c', fontSize: 14, fontWeight: 600 }}>Erro ao consultar a NASA</p>
          <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>Verifique se a API está rodando e com acesso à internet.</p>
        </div>
      )}

      {!loading && data && (
        <>
          {/* Results header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                {total} evento{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
              {total > 0 && (
                <span style={{ fontSize: 12, color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>
                  Página {page} de {totalPages}
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af' }}>{startDate} → {endDate}</p>
          </div>

          {total === 0 && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Nenhum evento CME no período selecionado.</p>
            </div>
          )}

          {/* Event cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paginated.map((event, i) => {
              const e = event as Record<string, unknown>
              const analyses = Array.isArray(e.cmeAnalyses) ? (e.cmeAnalyses as Record<string, unknown>[])[0] : null
              const globalIndex = (page - 1) * PAGE_SIZE + i + 1
              return (
                <div
                  key={i}
                  style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, minWidth: 24 }}>#{globalIndex}</span>
                        <span style={{ backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>CME</span>
                        <span style={{ color: '#9ca3af', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {String(e.activityID ?? '')}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
                        Início:{' '}
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#2563eb', fontWeight: 500 }}>
                          {String(e.startTime ?? '—')}
                        </span>
                      </p>

                      {e.note != null && (
                        <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>{String(e.note)}</p>
                      )}
                      {e.sourceLocation != null && (
                        <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 6 }}>Localização solar: {String(e.sourceLocation)}</p>
                      )}

                      {analyses && (
                        <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f4f6', flexWrap: 'wrap' as const }}>
                          {analyses.speed != null && (
                            <p style={{ fontSize: 12, color: '#6b7280' }}>
                              Velocidade{' '}
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#111827' }}>{String(analyses.speed)} km/s</span>
                            </p>
                          )}
                          {analyses.type != null && (
                            <p style={{ fontSize: 12, color: '#6b7280' }}>
                              Tipo{' '}
                              <span style={{ fontWeight: 600, color: '#111827' }}>{String(analyses.type)}</span>
                            </p>
                          )}
                          {analyses.latitude != null && (
                            <p style={{ fontSize: 12, color: '#6b7280' }}>
                              Lat{' '}
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#111827' }}>{String(analyses.latitude)}°</span>
                            </p>
                          )}
                          {analyses.longitude != null && (
                            <p style={{ fontSize: 12, color: '#6b7280' }}>
                              Lon{' '}
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#111827' }}>{String(analyses.longitude)}°</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {e.link != null && (
                      <a
                        href={String(e.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flexShrink: 0, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 8, textDecoration: 'none', backgroundColor: '#eff6ff' }}
                      >
                        Detalhes ↗
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                «
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                ‹ Anterior
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} style={{ padding: '6px 4px', fontSize: 12, color: '#9ca3af' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      style={{
                        width: 32, height: 32, fontSize: 12, fontWeight: p === page ? 700 : 500,
                        borderRadius: 6, border: '1px solid',
                        borderColor: p === page ? '#2563eb' : '#e5e7eb',
                        backgroundColor: p === page ? '#2563eb' : '#fff',
                        color: p === page ? '#fff' : '#374151',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: page === totalPages ? '#f9fafb' : '#fff', color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Próxima ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, borderRadius: 6, border: '1px solid #e5e7eb', backgroundColor: page === totalPages ? '#f9fafb' : '#fff', color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                »
              </button>

              <span style={{ marginLeft: 8, fontSize: 12, color: '#9ca3af' }}>
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
