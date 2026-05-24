import { refreshTokensFromStore } from 'src/api/client'
import { useAuthStore } from 'src/stores/auth.store'

const REFRESH_BEFORE_MS = 60_000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

async function runScheduledRefresh(): Promise<void> {
  const ok = await refreshTokensFromStore()
  if (!ok) {
    useAuthStore.getState().clearSession()
    if (window.location.pathname !== '/auth') {
      window.location.assign('/auth')
    }
    return
  }
  scheduleProactiveRefresh()
}

export function scheduleProactiveRefresh(): void {
  clearRefreshTimer()

  const expiresAt = useAuthStore.getState().accessExpiresAt
  if (!expiresAt) return

  const delay = Math.max(expiresAt - Date.now() - REFRESH_BEFORE_MS, 0)

  refreshTimer = setTimeout(() => {
    void runScheduledRefresh()
  }, delay)
}

export function stopProactiveRefresh(): void {
  clearRefreshTimer()
}
