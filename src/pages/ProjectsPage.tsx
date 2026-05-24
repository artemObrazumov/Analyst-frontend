import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { listProjects } from 'src/api/projects'
import AppHeader from 'src/components/layouts/AppHeader'
import { useAuthStore } from 'src/stores/auth.store'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  })

  async function handleLogout() {
    await logout()
    navigate({ to: '/auth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onLogout={() => void handleLogout()} />

      <div className="p-8">
        <h2 className="mb-6 text-xl font-semibold">Проекты</h2>

        {isLoading && (
          <p className="text-sm text-muted-foreground">Загрузка проектов…</p>
        )}

        {isError && !isLoading && (
          <p className="text-sm text-destructive">
            Не удалось загрузить проекты.
          </p>
        )}

        {!isLoading && !isError && projects.length === 0 && (
          <p className="text-sm text-muted-foreground">Проектов пока нет.</p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted"
            >
              <h3 className="font-medium">{project.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {project.description?.trim() || 'Без описания'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
