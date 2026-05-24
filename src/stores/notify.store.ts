import { create } from 'zustand'

export type ToastVariant = 'error' | 'info' | 'success'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface NotifyStore {
  toasts: Toast[]
  push: (message: string, variant?: ToastVariant) => void
  dismiss: (id: string) => void
}

const AUTO_DISMISS_MS = 5000

export const useNotifyStore = create<NotifyStore>((set, get) => ({
  toasts: [],
  push: (message, variant = 'error') => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
    window.setTimeout(() => {
      if (get().toasts.some((t) => t.id === id)) {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }
    }, AUTO_DISMISS_MS)
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
