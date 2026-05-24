import { LogOut } from 'lucide-react'
import { useAuthStore } from 'src/stores/auth.store'

interface AppHeaderProps {
  onLogout: () => void
}

export default function AppHeader({ onLogout }: AppHeaderProps) {
  const userName = useAuthStore((s) => s.userName)

  return (
    <header className="flex items-center justify-between border-b border-border px-8 py-4">
      <h1 className="text-lg font-semibold text-primary">Analyst</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground">{userName}</span>
        <button
          type="button"
          onClick={onLogout}
          title="Выйти"
          aria-label="Выйти"
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}
