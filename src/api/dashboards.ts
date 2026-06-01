import { apiRequest } from 'src/api/client'
import type {
  AddDashboardSeriesRequest,
  CreateDashboardRequest,
  DashboardDetailResponse,
  DashboardPageResponse,
  DashboardResponse,
  DashboardSeriesResponse,
  ReorderDashboardSeriesRequest,
  UpdateDashboardRequest,
  UpdateDashboardSeriesRequest,
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
): Promise<DashboardPageResponse> {
  return apiRequest<DashboardPageResponse>(
    `${dashboardPath(projectId, dashboardId)}/page`,
  )
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

export function addDashboardSeries(
  projectId: string,
  dashboardId: string,
  body: AddDashboardSeriesRequest,
): Promise<DashboardSeriesResponse> {
  return apiRequest<DashboardSeriesResponse>(
    `${dashboardPath(projectId, dashboardId)}/series`,
    { method: 'POST', body },
  )
}

export function updateDashboardSeries(
  projectId: string,
  dashboardId: string,
  seriesId: string,
  body: UpdateDashboardSeriesRequest,
): Promise<DashboardSeriesResponse> {
  return apiRequest<DashboardSeriesResponse>(
    `${dashboardPath(projectId, dashboardId)}/series/${seriesId}`,
    { method: 'PUT', body },
  )
}

export function deleteDashboardSeries(
  projectId: string,
  dashboardId: string,
  seriesId: string,
): Promise<void> {
  return apiRequest<void>(
    `${dashboardPath(projectId, dashboardId)}/series/${seriesId}`,
    { method: 'DELETE' },
  )
}

export function reorderDashboardSeries(
  projectId: string,
  dashboardId: string,
  body: ReorderDashboardSeriesRequest,
): Promise<void> {
  return apiRequest<void>(
    `${dashboardPath(projectId, dashboardId)}/series/reorder`,
    { method: 'PUT', body },
  )
}
