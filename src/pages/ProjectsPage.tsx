import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from 'src/stores/auth.store'

const MOCK_PROJECTS = [
  { id: '1', name: 'iOS App', description: '12 430 событий сегодня' },
  { id: '2', name: 'Android App', description: '9 821 событие сегодня' },
  { id: '3', name: 'Web', description: '34 102 события сегодня' },
  { id: '4', name: 'Backend SDK', description: '1 204 события сегодня' },
  { id: '5', name: 'Marketing Site', description: '7 650 событий сегодня' },
]

export default function ProjectsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  function handleLogout() {
    logout()
    navigate({ to: '/auth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-8 py-4">
        <h1 className="text-lg font-semibold">Analyst</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Выйти
        </button>
      </header>

      <div className="p-8">
        <h2 className="mb-6 text-xl font-semibold">Проекты</h2>
        <div className="grid grid-cols-3 gap-4">
          {MOCK_PROJECTS.map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted"
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
