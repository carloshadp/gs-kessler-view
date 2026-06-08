export type DebrisType = 'ROCKET_BODY' | 'DEBRIS' | 'PAYLOAD' | 'UNKNOWN'
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type DebrisStatus = 'ACTIVE' | 'DECAYED' | 'REMOVED' | 'MONITORING'
export type MissionPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
export type MissionStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type AlertSeverity = 'CATASTROPHIC' | 'CRITICAL' | 'WARNING' | 'INFO'

export interface OrbitalDebris {
  id: number
  noradId: string
  name: string
  type: DebrisType
  altitudeKm: number
  inclinationDeg: number
  eccentricity: number
  sizeCm: number | null
  massKg: number | null
  riskLevel: RiskLevel
  status: DebrisStatus
  launchDate: string | null
  discoveredAt: string
  orbitalPeriodMinutes: number
  objectCategory: string
}

export interface Mission {
  id: number
  name: string
  description: string | null
  targetDebrisId: number
  targetDebrisName: string
  targetDebrisNoradId: string
  priority: MissionPriority
  status: MissionStatus
  scheduledDate: string
  completedAt: string | null
  createdAt: string
}

export interface CollisionAlert {
  id: number
  primaryDebrisId: number
  primaryDebrisName: string
  primaryDebrisNoradId: string
  secondaryObjectId: string
  secondaryObjectName: string
  collisionProbability: number
  estimatedTimeToEvent: string | null
  severity: AlertSeverity
  acknowledged: boolean
  createdAt: string
}

export interface OrbitalDebrisRequest {
  noradId: string
  name: string
  type: DebrisType
  altitudeKm: number
  inclinationDeg: number
  eccentricity: number
  sizeCm: number | null
  massKg: number | null
  riskLevel: RiskLevel
  status: DebrisStatus
  launchDate: string | null
}

export interface MissionRequest {
  name: string
  description: string
  targetDebrisId: number
  priority: MissionPriority
  status: MissionStatus
  scheduledDate: string
}

export interface CollisionAlertRequest {
  primaryDebrisId: number
  secondaryObjectId: string
  secondaryObjectName: string
  collisionProbability: number
  estimatedTimeToEvent: string | null
  severity: AlertSeverity
}
