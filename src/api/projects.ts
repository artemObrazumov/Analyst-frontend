import { apiRequest } from 'src/api/client'
import type {
  ApiKeyCreatedResponse,
  ApiKeyMetaResponse,
  CreateProjectRequest,
  ProjectResponse,
  ProjectWithKeyResponse,
  UpdateProjectRequest,
} from 'src/types/project'

export function listProjects(): Promise<ProjectResponse[]> {
  return apiRequest<ProjectResponse[]>('/projects')
}

export function getProject(id: string): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>(`/projects/${id}`)
}

export function createProject(
  body: CreateProjectRequest,
): Promise<ProjectWithKeyResponse> {
  return apiRequest<ProjectWithKeyResponse>('/projects', {
    method: 'POST',
    body,
  })
}

export function updateProject(
  id: string,
  body: UpdateProjectRequest,
): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>(`/projects/${id}`, {
    method: 'PUT',
    body,
  })
}

export function deleteProject(id: string): Promise<void> {
  return apiRequest<void>(`/projects/${id}`, { method: 'DELETE' })
}

export function getProjectKeyMeta(id: string): Promise<ApiKeyMetaResponse> {
  return apiRequest<ApiKeyMetaResponse>(`/projects/${id}/key`)
}

export function rotateProjectKey(id: string): Promise<ApiKeyCreatedResponse> {
  return apiRequest<ApiKeyCreatedResponse>(`/projects/${id}/key/rotate`, {
    method: 'POST',
  })
}
