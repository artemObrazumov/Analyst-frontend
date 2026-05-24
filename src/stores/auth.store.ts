import { create } from 'zustand'

interface AuthStore {
  isAuthenticated: boolean
  userName: string
  login: (userName: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  userName: '',
  login: (userName) => set({ isAuthenticated: true, userName }),
  logout: () => set({ isAuthenticated: false, userName: '' }),
}))
