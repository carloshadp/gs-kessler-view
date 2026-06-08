import client from './client'

export const nasaApi = {
  getCme: (startDate?: string, endDate?: string) =>
    client.get<Record<string, unknown>[]>('/nasa/cme', {
      params: { ...(startDate && { startDate }), ...(endDate && { endDate }) },
    }).then(r => r.data),
}
