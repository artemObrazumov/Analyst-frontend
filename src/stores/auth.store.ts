import { create } from 'zustand'
import {
  getMeRequest,
  loginRequest,
  logoutRefreshOnly,
  logoutWithAccess,
  registerRequest,
  refreshRequest,
} from 'src/api/auth'
import { scheduleProactiveRefresh, stopProactiveRefresh } from 'src/auth/refreshScheduler'
import {
  clearStoredTokens,
  getStoredAccessExpiresAt,
  getStoredAccessToken,
  getStoredRefreshToken,
  hasStoredSession,
  saveTokens,
} from 'src/auth/tokenStorage'
import type { TokenResponse, UserResponse } from 'src/types/auth'

interface AuthStore {
  isInitialized: boolean
  isAuthenticated: boolean
  user: UserResponse | null
  accessToken: string | null
  refreshToken: string | null
  accessExpiresAt: number | null

  applyTokens: (tokens: TokenResponse) => void
  setUser: (user: UserResponse | null) => void
  clearSession: () => void
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

function isAccessValid(expiresAt: number | null): boolean {
  if (!expiresAt) return false
  return expiresAt > Date.now() + 5_000
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isInitialized: false,
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  accessExpiresAt: null,

  applyTokens: (tokens) => {
    const accessExpiresAt = Date.now() + tokens.expiresIn * 1000
    saveTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt,
      isAuthenticated: true,
    })
    scheduleProactiveRefresh()
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    stopProactiveRefresh()
    clearStoredTokens()
    set({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      accessExpiresAt: null,
    })
  },

  initialize: async () => {
    if (get().isInitialized) return

    const refreshToken = getStoredRefreshToken()
    const accessToken = getStoredAccessToken()
    const accessExpiresAt = getStoredAccessExpiresAt()

    if (!refreshToken) {
      set({ isInitialized: true, isAuthenticated: false })
      return
    }

    set({
      refreshToken,
      accessToken,
      accessExpiresAt,
      isAuthenticated: true,
    })

    try {
      if (!isAccessValid(accessExpiresAt)) {
        const tokens = await refreshRequest({ refreshToken })
        get().applyTokens(tokens)
      } else {
        scheduleProactiveRefresh()
      }

      const token = get().accessToken
      if (token) {
        const user = await getMeRequest(token)
        set({ user, isAuthenticated: true })
      }
    } catch {
      get().clearSession()
    } finally {
      set({ isInitialized: true })
    }
  },

  login: async (email, password) => {
    const tokens = await loginRequest({ email, password })
    get().applyTokens(tokens)
    const user = await getMeRequest(tokens.accessToken)
    set({ user, isAuthenticated: true })
  },

  register: async (name, email, password) => {
    const tokens = await registerRequest({ name, email, password })
    get().applyTokens(tokens)
    const user = await getMeRequest(tokens.accessToken)
    set({ user, isAuthenticated: true })
  },

  logout: async () => {
    const { accessToken, refreshToken, accessExpiresAt } = get()
    stopProactiveRefresh()

    try {
      if (
        accessToken &&
        refreshToken &&
        isAccessValid(accessExpiresAt)
      ) {
        await logoutWithAccess(accessToken, refreshToken)
      } else if (refreshToken) {
        await logoutRefreshOnly(refreshToken)
      }
    } catch {
      // Локально всё равно сбрасываем сессию
    } finally {
      get().clearSession()
    }
  },
}))

let initPromise: Promise<void> | null = null

export function ensureAuthInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = useAuthStore.getState().initialize()
  }
  return initPromise
}

export function hasPersistedSession(): boolean {
  return hasStoredSession()
}
