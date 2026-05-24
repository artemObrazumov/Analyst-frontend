import { X } from 'lucide-react'
import { useNotifyStore } from 'src/stores/notify.store'

const variantStyles = {
  error: 'border-destructive/40 bg-card text-foreground',
  info: 'border-border bg-card text-foreground',
  success: 'border-accent/40 bg-card text-foreground',
} as const

export default function Toaster() {
  const toasts = useNotifyStore((s) => s.toasts)
  const dismiss = useNotifyStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${variantStyles[toast.variant]}`}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Закрыть"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
