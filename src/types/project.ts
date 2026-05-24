export interface CreateProjectRequest {
  name: string
  description?: string | null
}

export interface UpdateProjectRequest {
  name?: string | null
  description?: string | null
}

export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiKeyCreatedResponse {
  id: string
  key: string
  label: string | null
  createdAt: string
}

export interface ApiKeyMetaResponse {
  id: string
  label: string | null
  isActive: boolean
  createdAt: string
}

export interface ProjectWithKeyResponse {
  project: ProjectResponse
  apiKey: ApiKeyCreatedResponse
}

export type ProjectTabId =
  | 'about'
  | 'dashboards'
  | 'keys'
  | 'experiments'
  | 'funnels'
