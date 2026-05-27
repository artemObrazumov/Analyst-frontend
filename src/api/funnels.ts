import { apiRequest } from 'src/api/client'
import type {
  AddFunnelStepRequest,
  CreateFunnelRequest,
  FunnelAnalysisQuery,
  FunnelAnalysisResponse,
  FunnelDetailResponse,
  FunnelResponse,
  FunnelStepResponse,
  ReorderFunnelStepsRequest,
  ReorderFunnelStepsResponse,
  UpdateFunnelRequest,
} from 'src/types/funnel'

function funnelPath(projectId: string, funnelId?: string): string {
  const base = `/projects/${projectId}/funnels`
  return funnelId ? `${base}/${funnelId}` : base
}

export function listFunnels(projectId: string): Promise<FunnelResponse[]> {
  return apiRequest<FunnelResponse[]>(funnelPath(projectId))
}

export function getFunnel(
  projectId: string,
  funnelId: string,
): Promise<FunnelDetailResponse> {
  return apiRequest<FunnelDetailResponse>(funnelPath(projectId, funnelId))
}

export function createFunnel(
  projectId: string,
  body: CreateFunnelRequest,
): Promise<FunnelResponse> {
  return apiRequest<FunnelResponse>(funnelPath(projectId), {
    method: 'POST',
    body,
  })
}

export function updateFunnel(
  projectId: string,
  funnelId: string,
  body: UpdateFunnelRequest,
): Promise<FunnelResponse> {
  return apiRequest<FunnelResponse>(funnelPath(projectId, funnelId), {
    method: 'PUT',
    body,
  })
}

export function deleteFunnel(
  projectId: string,
  funnelId: string,
): Promise<void> {
  return apiRequest<void>(funnelPath(projectId, funnelId), {
    method: 'DELETE',
  })
}

export function addFunnelStep(
  projectId: string,
  funnelId: string,
  body: AddFunnelStepRequest,
): Promise<FunnelStepResponse> {
  return apiRequest<FunnelStepResponse>(
    `${funnelPath(projectId, funnelId)}/steps`,
    { method: 'POST', body },
  )
}

export function deleteFunnelStep(
  projectId: string,
  funnelId: string,
  stepId: string,
): Promise<void> {
  return apiRequest<void>(
    `${funnelPath(projectId, funnelId)}/steps/${stepId}`,
    { method: 'DELETE' },
  )
}

export function reorderFunnelSteps(
  projectId: string,
  funnelId: string,
  body: ReorderFunnelStepsRequest,
): Promise<ReorderFunnelStepsResponse> {
  return apiRequest<ReorderFunnelStepsResponse>(
    `${funnelPath(projectId, funnelId)}/steps/reorder`,
    { method: 'PUT', body },
  )
}

export function analyzeFunnel(
  projectId: string,
  funnelId: string,
  query?: FunnelAnalysisQuery,
): Promise<FunnelAnalysisResponse> {
  const params = new URLSearchParams()
  if (query?.from) params.set('from', query.from)
  if (query?.to) params.set('to', query.to)
  const qs = params.toString()
  const path = `${funnelPath(projectId, funnelId)}/analysis${qs ? `?${qs}` : ''}`
  return apiRequest<FunnelAnalysisResponse>(path)
}
