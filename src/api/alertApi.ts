import client from './client'
import type { CollisionAlert, CollisionAlertRequest, AlertSeverity } from '../types'

export const alertApi = {
  getAll: (severity?: AlertSeverity) =>
    client.get<CollisionAlert[]>('/alerts', { params: severity ? { severity } : undefined }).then(r => r.data),

  getActive: () =>
    client.get<CollisionAlert[]>('/alerts/active').then(r => r.data),

  getById: (id: number) =>
    client.get<CollisionAlert>(`/alerts/${id}`).then(r => r.data),

  create: (data: CollisionAlertRequest) =>
    client.post<CollisionAlert>('/alerts', data).then(r => r.data),

  acknowledge: (id: number) =>
    client.put<CollisionAlert>(`/alerts/${id}/acknowledge`).then(r => r.data),

  delete: (id: number) =>
    client.delete(`/alerts/${id}`),
}
