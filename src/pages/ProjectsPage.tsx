import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { listProjects } from 'src/api/projects'
import CreateProjectDialog from 'src/components/projects/CreateProjectDialog'
import OneTimeApiKeyDialog from 'src/components/projects/OneTimeApiKeyDialog'
import AppHeader from 'src/components/layouts/AppHeader'
import { Button } from 'src/components/ui/button'
import { useAuthStore } from 'src/stores/auth.store'
import type {
  ApiKeyCreatedResponse,
  ProjectResponse,
  ProjectWithKeyResponse,
} from 'src/types/project'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)
  const [createOpen, setCreateOpen] = useState(false)
  const [oneTimeKey, setOneTimeKey] = useState<ApiKeyCreatedResponse | null>(
    null,
  )

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  })

  function handleCreated(result: ProjectWithKeyResponse) {
    queryClient.setQueryData<ProjectResponse[]>(['projects'], (old) => [
      result.project,
      ...(old ?? []),
    ])
    setCreateOpen(false)
    setOneTimeKey(result.apiKey)
  }

  async function handleLogout() {
    await logout()
    navigate({ to: '/auth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onLogout={() => void handleLogout()} />

      <div className="p-8 pb-24">
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
          <p className="text-sm text-muted-foreground">
            Проектов пока нет. Создайте первый проект.
          </p>
        )}

        {projects.length > 0 && (
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
        )}
      </div>

      <Button
        type="button"
        className="fixed bottom-6 right-6 h-10 gap-2 px-4 shadow-lg"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="size-4" />
        Создать проект
      </Button>

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <OneTimeApiKeyDialog
        open={oneTimeKey !== null}
        apiKey={oneTimeKey}
        onClose={() => setOneTimeKey(null)}
      />
    </div>
  )
}
