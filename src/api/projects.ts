import { apiRequest } from 'src/api/client'
import type { ProjectResponse } from 'src/types/project'

export function listProjects(): Promise<ProjectResponse[]> {
  return apiRequest<ProjectResponse[]>('/projects')
}

export function getProject(id: string): Promise<ProjectResponse> {
  return apiRequest<ProjectResponse>(`/projects/${id}`)
}
