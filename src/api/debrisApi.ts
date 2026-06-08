import client from './client'
import type { OrbitalDebris, OrbitalDebrisRequest, RiskLevel, DebrisStatus } from '../types'

export const debrisApi = {
  getAll: (params?: { riskLevel?: RiskLevel; status?: DebrisStatus; altitudeMin?: number; altitudeMax?: number }) =>
    client.get<OrbitalDebris[]>('/debris', { params }).then(r => r.data),

  getById: (id: number) =>
    client.get<OrbitalDebris>(`/debris/${id}`).then(r => r.data),

  getByNoradId: (noradId: string) =>
    client.get<OrbitalDebris>(`/debris/norad/${noradId}`).then(r => r.data),

  getCritical: () =>
    client.get<OrbitalDebris[]>('/debris/critical').then(r => r.data),

  create: (data: OrbitalDebrisRequest) =>
    client.post<OrbitalDebris>('/debris', data).then(r => r.data),

  update: (id: number, data: OrbitalDebrisRequest) =>
    client.put<OrbitalDebris>(`/debris/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/debris/${id}`),
}
