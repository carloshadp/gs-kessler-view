import client from './client'
import type { Mission, MissionRequest, MissionStatus } from '../types'

export const missionApi = {
  getAll: (status?: MissionStatus) =>
    client.get<Mission[]>('/missions', { params: status ? { status } : undefined }).then(r => r.data),

  getById: (id: number) =>
    client.get<Mission>(`/missions/${id}`).then(r => r.data),

  getByDebris: (debrisId: number) =>
    client.get<Mission[]>(`/missions/debris/${debrisId}`).then(r => r.data),

  create: (data: MissionRequest) =>
    client.post<Mission>('/missions', data).then(r => r.data),

  update: (id: number, data: MissionRequest) =>
    client.put<Mission>(`/missions/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/missions/${id}`),
}
