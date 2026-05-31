import { apiRequest } from 'src/api/client'
import type {
  AddDashboardChartRequest,
  CreateDashboardRequest,
  DashboardChartResponse,
  DashboardDetailResponse,
  DashboardPageQuery,
  DashboardPageResponse,
  DashboardResponse,
  ReorderDashboardChartsRequest,
  UpdateDashboardRequest,
} from 'src/types/dashboard'

function dashboardPath(projectId: string, dashboardId?: string): string {
  const base = `/projects/${projectId}/dashboards`
  return dashboardId ? `${base}/${dashboardId}` : base
}

export function listDashboards(projectId: string): Promise<DashboardResponse[]> {
  return apiRequest<DashboardResponse[]>(dashboardPath(projectId))
}

export function getDashboard(
  projectId: string,
  dashboardId: string,
): Promise<DashboardDetailResponse> {
  return apiRequest<DashboardDetailResponse>(
    dashboardPath(projectId, dashboardId),
  )
}

export function getDashboardPage(
  projectId: string,
  dashboardId: string,
  query?: DashboardPageQuery,
): Promise<DashboardPageResponse> {
  const params = new URLSearchParams()
  if (query?.from) params.set('from', query.from)
  if (query?.to) params.set('to', query.to)
  const qs = params.toString()
  const path = `${dashboardPath(projectId, dashboardId)}/page${qs ? `?${qs}` : ''}`
  return apiRequest<DashboardPageResponse>(path)
}

export function createDashboard(
  projectId: string,
  body: CreateDashboardRequest,
): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(dashboardPath(projectId), {
    method: 'POST',
    body,
  })
}

export function updateDashboard(
  projectId: string,
  dashboardId: string,
  body: UpdateDashboardRequest,
): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>(dashboardPath(projectId, dashboardId), {
    method: 'PUT',
    body,
  })
}

export function deleteDashboard(
  projectId: string,
  dashboardId: string,
): Promise<void> {
  return apiRequest<void>(dashboardPath(projectId, dashboardId), {
    method: 'DELETE',
  })
}

export function addDashboardChart(
  projectId: string,
  dashboardId: string,
  body: AddDashboardChartRequest,
): Promise<DashboardChartResponse> {
  return apiRequest<DashboardChartResponse>(
    `${dashboardPath(projectId, dashboardId)}/charts`,
    { method: 'POST', body },
  )
}

export function deleteDashboardChart(
  projectId: string,
  dashboardId: string,
  chartId: string,
): Promise<void> {
  return apiRequest<void>(
    `${dashboardPath(projectId, dashboardId)}/charts/${chartId}`,
    { method: 'DELETE' },
  )
}

export function reorderDashboardCharts(
  projectId: string,
  dashboardId: string,
  body: ReorderDashboardChartsRequest,
): Promise<void> {
  return apiRequest<void>(
    `${dashboardPath(projectId, dashboardId)}/charts/reorder`,
    { method: 'PUT', body },
  )
}
