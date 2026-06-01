export type DashboardSeriesPeriod = '7d' | '30d' | '90d'

export interface CreateDashboardRequest {
  name: string
  description?: string | null
}

export interface UpdateDashboardRequest {
  name?: string | null
  description?: string | null
}

export interface DashboardResponse {
  id: string
  projectId: string
  name: string
  description: string | null
}

export interface DashboardSeriesResponse {
  id: string
  label: string
  period: DashboardSeriesPeriod
  eventType: string
  platform: string | null
  osVersion: string | null
  appVersion: string | null
  country: string | null
  propertyFilters: Record<string, string>
  position: number
}

export interface DashboardDetailResponse extends DashboardResponse {
  series: DashboardSeriesResponse[]
}

export interface AddDashboardSeriesRequest {
  label: string
  period?: DashboardSeriesPeriod
  eventType: string
  platform?: string | null
  osVersion?: string | null
  appVersion?: string | null
  country?: string | null
  propertyFilters?: Record<string, string>
}

export interface UpdateDashboardSeriesRequest {
  label: string
  period: DashboardSeriesPeriod
  eventType: string
  platform?: string | null
  osVersion?: string | null
  appVersion?: string | null
  country?: string | null
  propertyFilters?: Record<string, string>
}

export interface ReorderDashboardSeriesRequest {
  seriesIds: string[]
}

export interface SeriesDataPoint {
  date: string
  count: number
}

export interface DashboardSeriesWithData extends DashboardSeriesResponse {
  data: SeriesDataPoint[]
}

export interface DashboardPageResponse {
  id: string
  name: string
  description: string | null
  series: DashboardSeriesWithData[]
}
