export interface CreateFunnelRequest {
  name: string
  description?: string | null
}

export interface UpdateFunnelRequest {
  name?: string | null
  description?: string | null
}

export interface FunnelResponse {
  id: string
  projectId: string
  createdBy: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface FunnelStepResponse {
  id: string
  eventType: string
  label: string
  stepOrder: number
}

export interface FunnelDetailResponse extends FunnelResponse {
  steps: FunnelStepResponse[]
}

export interface AddFunnelStepRequest {
  eventType: string
  label: string
}

export interface ReorderFunnelStepsRequest {
  stepIds: string[]
}

export interface ReorderFunnelStepsResponse {
  message: string
}

export interface FunnelAnalysisPeriod {
  from: string | null
  to: string | null
}

export interface FunnelStepAnalysis {
  stepId: string
  eventType: string
  label: string
  stepOrder: number
  usersCount: number
  conversionFromPrevious: number | null
  dropOffFromPrevious: number | null
  avgSecondsFromPrevious: number | null
}

export interface FunnelAnalysisResponse {
  funnelId: string
  funnelName: string
  period: FunnelAnalysisPeriod
  steps: FunnelStepAnalysis[]
  overallConversion: number
}

export interface FunnelAnalysisQuery {
  from?: string
  to?: string
}
