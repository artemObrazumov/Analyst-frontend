import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getDashboardPage } from 'src/api/dashboards'
import DashboardChartCard from 'src/components/dashboards/DashboardChartCard'
import { Button } from 'src/components/ui/button'
import {
  dateRangeToIsoQuery,
  isDateRangeValid,
  rangeForPreset,
  type DateRange,
  type DateRangePreset,
} from 'src/lib/date-range'
import { inputClassName } from 'src/lib/form-styles'
import { cn } from 'src/lib/utils'

interface DashboardPageViewProps {
  projectId: string
  dashboardId: string
  onBack: () => void
  onEdit: () => void
}

const PRESETS: { id: Exclude<DateRangePreset, 'custom'>; label: string }[] = [
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: '90d', label: '90 дней' },
]

export default function DashboardPageView({
  projectId,
  dashboardId,
  onBack,
  onEdit,
}: DashboardPageViewProps) {
  const initialRange = rangeForPreset('30d')
  const [preset, setPreset] = useState<DateRangePreset>('30d')
  const [draftRange, setDraftRange] = useState<DateRange>(initialRange)
  const [appliedRange, setAppliedRange] = useState<DateRange>(initialRange)
  const [rangeError, setRangeError] = useState<string | null>(null)

  const isoQuery = dateRangeToIsoQuery(appliedRange)

  const {
    data: page,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      'dashboard-page',
      projectId,
      dashboardId,
      appliedRange.from,
      appliedRange.to,
    ],
    queryFn: () => getDashboardPage(projectId, dashboardId, isoQuery),
  })

  function applyPreset(id: Exclude<DateRangePreset, 'custom'>) {
    setPreset(id)
    setDraftRange(rangeForPreset(id))
    setRangeError(null)
  }

  function handleApply() {
    setRangeError(null)
    if (!isDateRangeValid(draftRange)) {
      setRangeError('Дата начала не может быть позже даты окончания.')
      return
    }
    setAppliedRange({ ...draftRange })
  }

  const charts = [...(page?.charts ?? [])].sort(
    (a, b) => a.chartOrder - b.chartOrder,
  )

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку дэшбордов
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          title="Редактировать дэшборд"
          aria-label="Редактировать дэшборд"
        >
          <Pencil className="size-4" />
          Редактировать
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">{page?.name ?? 'Дэшборд'}</h2>
        {page?.description?.trim() && (
          <p className="mt-1 text-sm text-muted-foreground">
            {page.description}
          </p>
        )}
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-medium">Период</h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                preset === p.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background hover:bg-muted',
              )}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPreset('custom')
              setRangeError(null)
            }}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              preset === 'custom'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-muted',
            )}
          >
            Свой период
          </button>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="dash-range-from" className="text-xs text-muted-foreground">
              С
            </label>
            <input
              id="dash-range-from"
              type="date"
              value={draftRange.from}
              max={draftRange.to}
              onChange={(e) => {
                setDraftRange((r) => ({ ...r, from: e.target.value }))
                setPreset('custom')
                setRangeError(null)
              }}
              className={inputClassName}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="dash-range-to" className="text-xs text-muted-foreground">
              По
            </label>
            <input
              id="dash-range-to"
              type="date"
              value={draftRange.to}
              min={draftRange.from}
              onChange={(e) => {
                setDraftRange((r) => ({ ...r, to: e.target.value }))
                setPreset('custom')
                setRangeError(null)
              }}
              className={inputClassName}
            />
          </div>
          <Button type="button" onClick={handleApply} disabled={isFetching}>
            {isFetching ? 'Загрузка…' : 'Применить'}
          </Button>
        </div>

        {rangeError && (
          <p className="text-sm text-destructive">{rangeError}</p>
        )}
      </section>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка графиков…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить дэшборд.
        </p>
      )}

      {page && !isLoading && (
        <section className="space-y-4">
          {charts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Графиков пока нет.{' '}
              <button
                type="button"
                onClick={onEdit}
                className="text-primary underline underline-offset-4"
              >
                Добавьте графики
              </button>{' '}
              в редакторе.
            </p>
          ) : (
            <div className="grid gap-4">
              {charts.map((chart) => (
                <DashboardChartCard key={chart.id} chart={chart} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
