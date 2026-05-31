export type ChartType = 'line' | 'bar' | 'area'

export interface ChartFilters {
  platform?: string | null
  country?: string | null
  deviceId?: string | null
  userId?: string | null
  appVersion?: string | null
  osVersion?: string | null
  properties?: Record<string, string> | null
}

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
  createdBy: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface DashboardChartResponse {
  id: string
  title: string
  chartType: ChartType
  eventType: string
  chartOrder: number
  filters: ChartFilters
}

export interface DashboardDetailResponse extends DashboardResponse {
  charts: DashboardChartResponse[]
}

export interface AddDashboardChartRequest {
  title: string
  chartType?: ChartType
  eventType: string
  filters?: ChartFilters
}

export interface ReorderDashboardChartsRequest {
  chartIds: string[]
}

export interface ChartDataPoint {
  date: string
  count: number
}

export interface DashboardChartWithData extends DashboardChartResponse {
  data: ChartDataPoint[]
}

export interface DashboardPagePeriod {
  from: string | null
  to: string | null
}

export interface DashboardPageResponse {
  id: string
  name: string
  description: string | null
  period: DashboardPagePeriod
  charts: DashboardChartWithData[]
}

export interface DashboardPageQuery {
  from?: string
  to?: string
}
