import { apiRequest } from 'src/api/client'
import type {
  AddExperimentEventRequest,
  AddExperimentGroupRequest,
  CreateExperimentRequest,
  ExperimentAnalysisResponse,
  ExperimentDetailResponse,
  ExperimentEventResponse,
  ExperimentGroupResponse,
  ExperimentResponse,
  UpdateExperimentRequest,
  UpdateExperimentStatusRequest,
} from 'src/types/experiment'

function experimentPath(projectId: string, experimentId?: string): string {
  const base = `/projects/${projectId}/experiments`
  return experimentId ? `${base}/${experimentId}` : base
}

export function listExperiments(projectId: string): Promise<ExperimentResponse[]> {
  return apiRequest<ExperimentResponse[]>(experimentPath(projectId))
}

export function getExperiment(
  projectId: string,
  experimentId: string,
): Promise<ExperimentDetailResponse> {
  return apiRequest<ExperimentDetailResponse>(
    experimentPath(projectId, experimentId),
  )
}

export function createExperiment(
  projectId: string,
  body: CreateExperimentRequest,
): Promise<ExperimentResponse> {
  return apiRequest<ExperimentResponse>(experimentPath(projectId), {
    method: 'POST',
    body,
  })
}

export function updateExperiment(
  projectId: string,
  experimentId: string,
  body: UpdateExperimentRequest,
): Promise<ExperimentResponse> {
  return apiRequest<ExperimentResponse>(
    experimentPath(projectId, experimentId),
    { method: 'PUT', body },
  )
}

export function updateExperimentStatus(
  projectId: string,
  experimentId: string,
  body: UpdateExperimentStatusRequest,
): Promise<ExperimentResponse> {
  return apiRequest<ExperimentResponse>(
    `${experimentPath(projectId, experimentId)}/status`,
    { method: 'PUT', body },
  )
}

export function deleteExperiment(
  projectId: string,
  experimentId: string,
): Promise<void> {
  return apiRequest<void>(experimentPath(projectId, experimentId), {
    method: 'DELETE',
  })
}

export function addExperimentGroup(
  projectId: string,
  experimentId: string,
  body: AddExperimentGroupRequest,
): Promise<ExperimentGroupResponse> {
  return apiRequest<ExperimentGroupResponse>(
    `${experimentPath(projectId, experimentId)}/groups`,
    { method: 'POST', body },
  )
}

export function deleteExperimentGroup(
  projectId: string,
  experimentId: string,
  groupId: string,
): Promise<void> {
  return apiRequest<void>(
    `${experimentPath(projectId, experimentId)}/groups/${groupId}`,
    { method: 'DELETE' },
  )
}

export function addExperimentEvent(
  projectId: string,
  experimentId: string,
  body: AddExperimentEventRequest,
): Promise<ExperimentEventResponse> {
  return apiRequest<ExperimentEventResponse>(
    `${experimentPath(projectId, experimentId)}/events`,
    { method: 'POST', body },
  )
}

export function deleteExperimentEvent(
  projectId: string,
  experimentId: string,
  eventId: string,
): Promise<void> {
  return apiRequest<void>(
    `${experimentPath(projectId, experimentId)}/events/${eventId}`,
    { method: 'DELETE' },
  )
}

export function analyzeExperiment(
  projectId: string,
  experimentId: string,
): Promise<ExperimentAnalysisResponse> {
  return apiRequest<ExperimentAnalysisResponse>(
    `${experimentPath(projectId, experimentId)}/analysis`,
  )
}
