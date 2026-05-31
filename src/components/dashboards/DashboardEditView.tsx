import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { ApiError } from 'src/api/errors'
import {
  deleteDashboard,
  deleteDashboardChart,
  getDashboard,
  updateDashboard,
} from 'src/api/dashboards'
import AddDashboardChartDialog from 'src/components/dashboards/AddDashboardChartDialog'
import { Button } from 'src/components/ui/button'
import { chartTypeLabel } from 'src/lib/chart-labels'
import { formatChartFiltersSummary } from 'src/lib/chart-filters'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'

interface DashboardEditViewProps {
  projectId: string
  dashboardId: string
  onBack: () => void
  onDeleted: () => void
}

export default function DashboardEditView({
  projectId,
  dashboardId,
  onBack,
  onDeleted,
}: DashboardEditViewProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [addChartOpen, setAddChartOpen] = useState(false)

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard', projectId, dashboardId],
    queryFn: () => getDashboard(projectId, dashboardId),
  })

  useEffect(() => {
    if (dashboard) {
      setName(dashboard.name)
      setDescription(dashboard.description ?? '')
      setDirty(false)
    }
  }, [dashboard])

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDashboard(projectId, dashboardId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: () => {
      setSaveError(null)
      setDirty(false)
      void queryClient.invalidateQueries({
        queryKey: ['dashboard', projectId, dashboardId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['dashboards', projectId],
      })
    },
    onError: (err) => {
      setSaveError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось сохранить изменения.',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteDashboard(projectId, dashboardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['dashboards', projectId],
      })
      onDeleted()
    },
  })

  const deleteChartMutation = useMutation({
    mutationFn: (chartId: string) =>
      deleteDashboardChart(projectId, dashboardId, chartId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['dashboard', projectId, dashboardId],
      })
    },
  })

  function handleDelete() {
    const confirmed = window.confirm(
      'Удалить дэшборд и все графики? Это действие нельзя отменить.',
    )
    if (confirmed) deleteMutation.mutate()
  }

  function handleDeleteChart(chartId: string, title: string) {
    const confirmed = window.confirm(`Удалить график «${title}»?`)
    if (confirmed) deleteChartMutation.mutate(chartId)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    if (!name.trim()) {
      setSaveError('Укажите название дэшборда.')
      return
    }
    updateMutation.mutate()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>
  }

  if (isError || !dashboard) {
    return (
      <div className="space-y-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку дэшбордов
        </Button>
        <p className="text-sm text-destructive">Не удалось загрузить дэшборд.</p>
      </div>
    )
  }

  const charts = [...dashboard.charts].sort(
    (a, b) => a.chartOrder - b.chartOrder,
  )

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку дэшбордов
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="size-4" />
          Удалить
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-xl font-semibold">Редактирование дэшборда</h2>

        {saveError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="edit-dashboard-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="edit-dashboard-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setDirty(true)
            }}
            className={inputClassName}
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="edit-dashboard-description"
            className="text-sm font-medium"
          >
            Описание
          </label>
          <textarea
            id="edit-dashboard-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setDirty(true)
            }}
            rows={2}
            className={inputClassName}
            disabled={updateMutation.isPending}
          />
        </div>

        {dirty && (
          <Button type="submit" size="sm" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        )}
      </form>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Графики</h3>
          <Button type="button" size="sm" onClick={() => setAddChartOpen(true)}>
            <Plus className="size-4" />
            Добавить график
          </Button>
        </div>

        {charts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Графиков пока нет. Добавьте первый график.
          </p>
        ) : (
          <ul className="space-y-2">
            {charts.map((chart) => {
              const filtersSummary = formatChartFiltersSummary(chart.filters)
              return (
              <li
                key={chart.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{chart.title}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {chart.eventType} · {chartTypeLabel(chart.chartType)}
                  </p>
                  {filtersSummary && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Фильтры: {filtersSummary}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDeleteChart(chart.id, chart.title)}
                  disabled={deleteChartMutation.isPending}
                  aria-label="Удалить график"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            )})}
          </ul>
        )}
      </section>

      <AddDashboardChartDialog
        projectId={projectId}
        dashboardId={dashboardId}
        open={addChartOpen}
        onClose={() => setAddChartOpen(false)}
        onAdded={() => {
          void queryClient.invalidateQueries({
            queryKey: ['dashboard', projectId, dashboardId],
          })
        }}
      />
    </div>
  )
}
