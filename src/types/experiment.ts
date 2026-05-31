export type ExperimentStatus = 'draft' | 'active' | 'archived'

export interface CreateExperimentRequest {
  name: string
  description?: string | null
}

export interface UpdateExperimentRequest {
  name?: string | null
  description?: string | null
  result?: string | null
}

export interface UpdateExperimentStatusRequest {
  status: ExperimentStatus
}

export interface ExperimentResponse {
  id: string
  projectId: string
  createdBy: string
  name: string
  description: string | null
  status: ExperimentStatus
  result: string | null
  createdAt: string
  updatedAt: string
}

export interface ExperimentGroupResponse {
  id: string
  propertyKey: string
  propertyValue: string
  label: string
}

export interface ExperimentEventResponse {
  id: string
  eventType: string
  note: string | null
}

export interface ExperimentDetailResponse extends ExperimentResponse {
  groups: ExperimentGroupResponse[]
  events: ExperimentEventResponse[]
}

export interface AddExperimentGroupRequest {
  propertyKey: string
  propertyValue: string
  label: string
}

export interface AddExperimentEventRequest {
  eventType: string
  note?: string | null
}

export interface GroupAnalysisResponse {
  label: string
  propertyKey: string
  propertyValue: string
  exposed: number
  converted: number
  conversionRate: number
}

export interface ExperimentAnalysisResponse {
  experimentId: string
  experimentName: string
  trackedEvents: string[]
  groups: GroupAnalysisResponse[]
}
