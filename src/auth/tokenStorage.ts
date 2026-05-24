const REFRESH_KEY = 'analyst_refresh_token'
const ACCESS_KEY = 'analyst_access_token'
const EXPIRES_AT_KEY = 'analyst_access_expires_at'

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getStoredAccessExpiresAt(): number | null {
  const raw = localStorage.getItem(EXPIRES_AT_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): void {
  const accessExpiresAt = Date.now() + expiresIn * 1000
  localStorage.setItem(ACCESS_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(EXPIRES_AT_KEY, String(accessExpiresAt))
}

export function clearStoredTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(EXPIRES_AT_KEY)
}

export function hasStoredSession(): boolean {
  return Boolean(getStoredRefreshToken())
}
