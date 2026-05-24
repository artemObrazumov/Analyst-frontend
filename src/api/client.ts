import { API_BASE_URL, API_PREFIX } from 'src/config/api'
import { refreshRequest } from 'src/api/auth'
import { ApiError } from 'src/api/errors'
import { defaultMessageForStatus, toUserMessage } from 'src/lib/user-messages'
import { useAuthStore } from 'src/stores/auth.store'
import { useNotifyStore } from 'src/stores/notify.store'
import type { ApiErrorBody, TokenResponse } from 'src/types/auth'

export { ApiError } from 'src/api/errors'

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** По умолчанию true — добавляет Bearer и обрабатывает 401/403 */
  auth?: boolean
  /** Не повторять запрос после refresh (для /auth/refresh) */
  skipRetry?: boolean
}

let refreshInFlight: Promise<boolean> | null = null

function buildUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${API_PREFIX}${normalized}`
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | null> {
  try {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text) as ApiErrorBody
  } catch {
    return null
  }
}

function redirectToAuth(): void {
  useAuthStore.getState().clearSession()
  const authPath = '/auth'
  if (window.location.pathname !== authPath) {
    window.location.assign(authPath)
  }
}

async function runRefresh(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return false

  try {
    const response = await fetch(buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) return false

    const tokens = (await response.json()) as TokenResponse
    useAuthStore.getState().applyTokens(tokens)
    return true
  } catch {
    return false
  }
}

export async function refreshSessionOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = runRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, skipRetry = false, body, headers, ...init } = options

  const doFetch = async (): Promise<Response> => {
    const requestHeaders = new Headers(headers)
    if (body !== undefined) {
      requestHeaders.set('Content-Type', 'application/json')
    }
    if (auth) {
      const accessToken = useAuthStore.getState().accessToken
      if (accessToken) {
        requestHeaders.set('Authorization', `Bearer ${accessToken}`)
      }
    }

    return fetch(buildUrl(path), {
      ...init,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let response = await doFetch()

  if (auth && response.status === 401 && !skipRetry) {
    const refreshed = await refreshSessionOnce()
    if (refreshed) {
      response = await doFetch()
    }
    if (response.status === 401) {
      redirectToAuth()
      const errBody = await parseErrorBody(response)
      throw new ApiError(
        401,
        errBody?.error ?? 'UNAUTHORIZED',
        errBody?.message ?? 'Сессия истекла. Войдите снова.',
      )
    }
  }

  if (response.status === 403) {
    const errBody = await parseErrorBody(response)
    const apiErr = new ApiError(
      403,
      errBody?.error ?? 'FORBIDDEN',
      errBody?.message ?? '',
    )
    const message = toUserMessage(apiErr)
    useNotifyStore.getState().push(message, 'error')
    throw apiErr
  }

  if (!response.ok) {
    const errBody = await parseErrorBody(response)
    throw new ApiError(
      response.status,
      errBody?.error ?? 'ERROR',
      errBody?.message ?? defaultMessageForStatus(response.status),
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

/** Refresh через store (для проактивного таймера) */
export async function refreshTokensFromStore(): Promise<boolean> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return false

  try {
    const tokens = await refreshRequest({ refreshToken })
    if (!tokens.accessToken) return false
    useAuthStore.getState().applyTokens(tokens)
    return true
  } catch {
    return false
  }
}
