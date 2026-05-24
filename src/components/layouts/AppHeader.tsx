import { LogOut } from 'lucide-react'
import { useAuthStore } from 'src/stores/auth.store'

interface AppHeaderProps {
  onLogout: () => void
  loggingOut?: boolean
}

export default function AppHeader({ onLogout, loggingOut }: AppHeaderProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <h1 className="text-lg font-semibold text-primary">Analyst</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">
          {user?.name ?? user?.email ?? '…'}
        </span>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          title="Выйти"
          aria-label="Выйти"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
