import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { listDashboards } from 'src/api/dashboards'
import CreateDashboardDialog from 'src/components/dashboards/CreateDashboardDialog'
import DashboardEditView from 'src/components/dashboards/DashboardEditView'
import DashboardPageView from 'src/components/dashboards/DashboardPageView'
import { Button } from 'src/components/ui/button'
import type { DashboardResponse } from 'src/types/dashboard'

type DashboardScreen =
  | { dashboardId: string; mode: 'view' }
  | { dashboardId: string; mode: 'edit' }
  | null

interface DashboardsPanelProps {
  projectId: string
}

export default function DashboardsPanel({ projectId }: DashboardsPanelProps) {
  const queryClient = useQueryClient()
  const [screen, setScreen] = useState<DashboardScreen>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: dashboards = [], isLoading, isError } = useQuery({
    queryKey: ['dashboards', projectId],
    queryFn: () => listDashboards(projectId),
  })

  function handleCreated(dashboard: DashboardResponse) {
    queryClient.setQueryData<DashboardResponse[]>(
      ['dashboards', projectId],
      (old) => [dashboard, ...(old ?? [])],
    )
    setCreateOpen(false)
    setScreen({ dashboardId: dashboard.id, mode: 'view' })
  }

  if (screen?.mode === 'view') {
    return (
      <DashboardPageView
        projectId={projectId}
        dashboardId={screen.dashboardId}
        onBack={() => setScreen(null)}
        onEdit={() =>
          setScreen({ dashboardId: screen.dashboardId, mode: 'edit' })
        }
      />
    )
  }

  if (screen?.mode === 'edit') {
    return (
      <DashboardEditView
        projectId={projectId}
        dashboardId={screen.dashboardId}
        onBack={() => setScreen(null)}
        onDeleted={() => setScreen(null)}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Дэшборды</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Графики событий по дням за выбранный период.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Создать дэшборд
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка дэшбордов…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить дэшборды.
        </p>
      )}

      {!isLoading && !isError && dashboards.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Дэшбордов пока нет. Создайте первый дэшборд.
        </p>
      )}

      {dashboards.length > 0 && (
        <div className="space-y-2">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card pr-2 transition-colors hover:bg-muted/50"
            >
              <button
                type="button"
                onClick={() =>
                  setScreen({ dashboardId: dashboard.id, mode: 'view' })
                }
                className="flex min-w-0 flex-1 items-center gap-6 px-5 py-4 text-left"
              >
                <span className="shrink-0 font-medium">{dashboard.name}</span>
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {dashboard.description?.trim() || 'Без описания'}
                </span>
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() =>
                  setScreen({ dashboardId: dashboard.id, mode: 'edit' })
                }
                title="Редактировать"
                aria-label="Редактировать дэшборд"
                className="shrink-0 border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 hover:text-primary"
              >
                <Pencil className="size-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateDashboardDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
