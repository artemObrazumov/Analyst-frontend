import { API_BASE_URL, API_PREFIX } from 'src/config/api'
import { ApiError } from 'src/api/errors'
import type {
  LoginRequest,
  LogoutResponse,
  RefreshRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
  ApiErrorBody,
} from 'src/types/auth'

function apiUrl(path: string): string {
  return `${API_BASE_URL}${API_PREFIX}${path}`
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return
  const body = await parseJson<ApiErrorBody>(response)
  throw new ApiError(
    response.status,
    body.error ?? 'ERROR',
    body.message ?? response.statusText,
  )
}

export async function loginRequest(body: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(apiUrl('/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await throwIfNotOk(response)
  return parseJson<TokenResponse>(response)
}

export async function registerRequest(
  body: RegisterRequest,
): Promise<TokenResponse> {
  const response = await fetch(apiUrl('/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await throwIfNotOk(response)
  return parseJson<TokenResponse>(response)
}

export async function refreshRequest(
  body: RefreshRequest,
): Promise<TokenResponse> {
  const response = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  await throwIfNotOk(response)
  return parseJson<TokenResponse>(response)
}

export async function logoutRefreshOnly(
  refreshToken: string,
): Promise<LogoutResponse> {
  const response = await fetch(apiUrl('/auth/logout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  await throwIfNotOk(response)
  return parseJson<LogoutResponse>(response)
}

export async function logoutWithAccess(
  accessToken: string,
  refreshToken: string,
): Promise<LogoutResponse> {
  const response = await fetch(apiUrl('/users/me/logout'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  })
  await throwIfNotOk(response)
  return parseJson<LogoutResponse>(response)
}

export async function getMeRequest(accessToken: string): Promise<UserResponse> {
  const response = await fetch(apiUrl('/users/me'), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  await throwIfNotOk(response)
  return parseJson<UserResponse>(response)
}
