import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useParams, Link } from '@tanstack/react-router'
import { getProject } from 'src/api/projects'
import ProjectAboutPanel from 'src/components/projects/ProjectAboutPanel'
import ProjectKeysPanel from 'src/components/projects/ProjectKeysPanel'
import ProjectTabPlaceholder from 'src/components/projects/ProjectTabPlaceholder'
import FunnelsPanel from 'src/components/funnels/FunnelsPanel'
import type { ProjectTabId } from 'src/types/project'

const TABS: { id: ProjectTabId; label: string }[] = [
  { id: 'about', label: 'О проекте' },
  { id: 'dashboards', label: 'Дэшборды' },
  { id: 'keys', label: 'Ключи' },
  { id: 'experiments', label: 'Эксперименты' },
  { id: 'funnels', label: 'Воронки' },
]

export default function ProjectPage() {
  const { projectId } = useParams({ from: '/projects/$projectId' })
  const [activeTab, setActiveTab] = useState<ProjectTabId>('about')

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId),
  })

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-[20%] min-w-[200px] flex-col border-r border-border py-4">
        <div className="mb-6 flex items-center gap-1 px-4">
          <Link
            to="/projects"
            title="Все проекты"
            aria-label="Все проекты"
            className="rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-6 shrink-0" strokeWidth={2.25} />
          </Link>
          <p className="truncate text-sm font-medium">
            {project?.name ?? (isLoading ? 'Загрузка…' : `Проект ${projectId}`)}
          </p>
        </div>

        <nav>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-none px-4 py-2 text-left text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Загрузка проекта…</p>
        )}

        {isError && (
          <p className="text-sm text-destructive">
            Не удалось загрузить проект.
          </p>
        )}

        {project && activeTab === 'about' && (
          <ProjectAboutPanel project={project} />
        )}

        {activeTab === 'dashboards' && (
          <ProjectTabPlaceholder title="Дэшборды" />
        )}

        {project && activeTab === 'keys' && (
          <ProjectKeysPanel projectId={projectId} />
        )}

        {activeTab === 'experiments' && (
          <ProjectTabPlaceholder title="Эксперименты" />
        )}

        {activeTab === 'funnels' && (
          <FunnelsPanel projectId={projectId} />
        )}
      </main>
    </div>
  )
}
