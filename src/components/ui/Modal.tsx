import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from 'src/lib/utils'

interface ModalProps {
  open: boolean
  onClose?: () => void
  title: string
  children: ReactNode
  className?: string
  /** Закрытие по клику на фон и по крестику */
  dismissible?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
  dismissible = true,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Закрыть"
        onClick={dismissible ? onClose : undefined}
        tabIndex={dismissible ? 0 : -1}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          {dismissible && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Закрыть"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
