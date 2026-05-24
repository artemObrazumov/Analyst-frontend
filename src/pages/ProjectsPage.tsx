import { Link, useNavigate } from '@tanstack/react-router'
import AppHeader from 'src/components/layouts/AppHeader'
import { useAuthStore } from 'src/stores/auth.store'

const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'iOS App',
    description: 'Мобильная аналитика для приложения на iOS: воронки, retention и события в реальном времени.',
  },
  {
    id: '2',
    name: 'Android App',
    description: 'Сбор и визуализация пользовательских сценариев в Android-клиенте.',
  },
  {
    id: '3',
    name: 'Web',
    description: 'Веб-воронки, источники трафика и поведение на ключевых страницах.',
  },
  {
    id: '4',
    name: 'Backend SDK',
    description: 'Серверные события и интеграции для микросервисов и batch-отчётов.',
  },
  {
    id: '5',
    name: 'Marketing Site',
    description: 'Лендинги, UTM-метки и конверсии рекламных кампаний.',
  },
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
      <AppHeader onLogout={handleLogout} />

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
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
