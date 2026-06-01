import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { analyzeFunnel, getFunnel } from 'src/api/funnels'
import { Button } from 'src/components/ui/button'
import {
  dateRangeToIsoQuery,
  isDateRangeValid,
  rangeForPreset,
  type DateRange,
  type DateRangePreset,
} from 'src/lib/date-range'
import {
  formatDurationSeconds,
  formatPercent,
  formatUsersCount,
} from 'src/lib/format-metrics'
import { inputClassName } from 'src/lib/form-styles'
import { funnelStepDisplayTitle } from 'src/lib/funnel-step-display'
import { cn } from 'src/lib/utils'

interface FunnelAnalyzeViewProps {
  projectId: string
  funnelId: string
  onBack: () => void
  onEdit: () => void
}

const PRESETS: { id: Exclude<DateRangePreset, 'custom'>; label: string }[] = [
  { id: '7d', label: '7 дней' },
  { id: '30d', label: '30 дней' },
  { id: '90d', label: '90 дней' },
]

export default function FunnelAnalyzeView({
  projectId,
  funnelId,
  onBack,
  onEdit,
}: FunnelAnalyzeViewProps) {
  const initialRange = rangeForPreset('30d')
  const [preset, setPreset] = useState<DateRangePreset>('30d')
  const [draftRange, setDraftRange] = useState<DateRange>(initialRange)
  const [appliedRange, setAppliedRange] = useState<DateRange>(initialRange)
  const [rangeError, setRangeError] = useState<string | null>(null)

  const { data: funnelMeta } = useQuery({
    queryKey: ['funnel', projectId, funnelId],
    queryFn: () => getFunnel(projectId, funnelId),
  })

  const isoQuery = dateRangeToIsoQuery(appliedRange)

  const {
    data: analysis,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: [
      'funnel-analysis',
      projectId,
      funnelId,
      appliedRange.from,
      appliedRange.to,
    ],
    queryFn: () => analyzeFunnel(projectId, funnelId, isoQuery),
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

  const steps = [...(analysis?.steps ?? [])].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  )

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку воронок
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          title="Редактировать воронку"
          aria-label="Редактировать воронку"
        >
          <Pencil className="size-4" />
          Редактировать
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">
          {analysis?.funnelName ?? funnelMeta?.name ?? 'Воронка'}
        </h2>
        {funnelMeta?.description?.trim() && (
          <p className="mt-1 text-sm text-muted-foreground">
            {funnelMeta.description}
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
            <label htmlFor="range-from" className="text-xs text-muted-foreground">
              С
            </label>
            <input
              id="range-from"
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
            <label htmlFor="range-to" className="text-xs text-muted-foreground">
              По
            </label>
            <input
              id="range-to"
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
        <p className="text-sm text-muted-foreground">Расчёт воронки…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить аналитику. Проверьте период и попробуйте снова.
        </p>
      )}

      {analysis && !isLoading && (
        <>
          {steps.length > 0 && (
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <p className="text-sm text-muted-foreground">Общая конверсия</p>
              <p className="text-3xl font-semibold text-primary">
                {formatPercent(analysis.overallConversion)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                от первого шага до последнего
              </p>
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-sm font-medium">Воронка</h3>

            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                В воронке нет шагов.{' '}
                <button
                  type="button"
                  onClick={onEdit}
                  className="text-primary underline underline-offset-4"
                >
                  Добавьте шаги
                </button>{' '}
                в редакторе.
              </p>
            ) : (
              <div className="flex w-full flex-col items-center gap-2">
                {steps.map((step, index) => {
                  const nextStep = steps[index + 1]
                  return (
                    <div
                      key={step.stepId}
                      className="flex w-full flex-col items-center gap-1"
                    >
                      <div className="flex min-h-16 w-full items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium font-mono">
                            {funnelStepDisplayTitle(
                              step.eventType,
                              step.propertyFilters,
                            )}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-semibold tabular-nums">
                            {formatUsersCount(step.usersCount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            пользователей
                          </p>
                        </div>
                      </div>
                      {nextStep && (
                        <div className="space-y-0.5 px-2 text-center text-xs text-muted-foreground">
                          {nextStep.conversionFromPrevious !== null && (
                            <p>
                              ↓ конверсия{' '}
                              {formatPercent(nextStep.conversionFromPrevious)}
                              {nextStep.dropOffFromPrevious !== null && (
                                <>
                                  {' '}
                                  · отсев{' '}
                                  {formatPercent(nextStep.dropOffFromPrevious)}
                                </>
                              )}
                            </p>
                          )}
                          {nextStep.avgSecondsFromPrevious !== null && (
                            <p>
                              ср. время:{' '}
                              {formatDurationSeconds(
                                nextStep.avgSecondsFromPrevious,
                              )}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
