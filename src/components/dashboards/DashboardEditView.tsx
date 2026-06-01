import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { ApiError } from 'src/api/errors'
import {
  deleteDashboard,
  deleteDashboardSeries,
  getDashboard,
  updateDashboard,
} from 'src/api/dashboards'
import AddDashboardSeriesDialog from 'src/components/dashboards/AddDashboardSeriesDialog'
import EditDashboardSeriesDialog from 'src/components/dashboards/EditDashboardSeriesDialog'
import { Button } from 'src/components/ui/button'
import { formatSeriesFiltersSummary } from 'src/lib/series-filters'
import { seriesPeriodLabel } from 'src/lib/series-period'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { DashboardSeriesResponse } from 'src/types/dashboard'

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
  const [addSeriesOpen, setAddSeriesOpen] = useState(false)
  const [editingSeries, setEditingSeries] =
    useState<DashboardSeriesResponse | null>(null)

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

  const deleteSeriesMutation = useMutation({
    mutationFn: (seriesId: string) =>
      deleteDashboardSeries(projectId, dashboardId, seriesId),
    onSuccess: () => {
      handleSeriesUpdated()
    },
  })

  function handleSeriesUpdated() {
    void queryClient.invalidateQueries({
      queryKey: ['dashboard', projectId, dashboardId],
    })
    void queryClient.invalidateQueries({
      queryKey: ['dashboard-page', projectId, dashboardId],
    })
  }

  function handleDelete() {
    const confirmed = window.confirm(
      'Удалить дэшборд и все серии? Это действие нельзя отменить.',
    )
    if (confirmed) deleteMutation.mutate()
  }

  function handleDeleteSeries(seriesId: string, label: string) {
    const confirmed = window.confirm(`Удалить серию «${label}»?`)
    if (confirmed) deleteSeriesMutation.mutate(seriesId)
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

  const seriesList = [...dashboard.series].sort((a, b) => a.position - b.position)

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
          <h3 className="text-lg font-semibold">Серии</h3>
          <Button type="button" size="sm" onClick={() => setAddSeriesOpen(true)}>
            <Plus className="size-4" />
            Добавить серию
          </Button>
        </div>

        {seriesList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Серий пока нет. Добавьте первую серию.
          </p>
        ) : (
          <ul className="space-y-2">
            {seriesList.map((item) => {
              const filtersSummary = formatSeriesFiltersSummary(item)
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.eventType} · {seriesPeriodLabel(item.period)}
                    </p>
                    {filtersSummary && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Фильтры: {filtersSummary}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setEditingSeries(item)}
                    title="Редактировать серию"
                    aria-label="Редактировать серию"
                    className="border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 hover:text-primary"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDeleteSeries(item.id, item.label)}
                    disabled={deleteSeriesMutation.isPending}
                    aria-label="Удалить серию"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <AddDashboardSeriesDialog
        projectId={projectId}
        dashboardId={dashboardId}
        open={addSeriesOpen}
        onClose={() => setAddSeriesOpen(false)}
        onAdded={handleSeriesUpdated}
      />

      <EditDashboardSeriesDialog
        projectId={projectId}
        dashboardId={dashboardId}
        series={editingSeries}
        open={editingSeries !== null}
        onClose={() => setEditingSeries(null)}
        onUpdated={handleSeriesUpdated}
      />
    </div>
  )
}
