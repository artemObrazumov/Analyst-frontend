import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { analyzeExperiment, getExperiment } from 'src/api/experiments'
import { Button } from 'src/components/ui/button'
import { EXPERIMENT_STATUS_LABELS } from 'src/lib/experiment-status'
import { formatPercent, formatUsersCount } from 'src/lib/format-metrics'

interface ExperimentAnalyzeViewProps {
  projectId: string
  experimentId: string
  onBack: () => void
  onEdit: () => void
}

export default function ExperimentAnalyzeView({
  projectId,
  experimentId,
  onBack,
  onEdit,
}: ExperimentAnalyzeViewProps) {
  const { data: experimentMeta } = useQuery({
    queryKey: ['experiment', projectId, experimentId],
    queryFn: () => getExperiment(projectId, experimentId),
  })

  const {
    data: analysis,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['experiment-analysis', projectId, experimentId],
    queryFn: () => analyzeExperiment(projectId, experimentId),
  })

  const groups = analysis?.groups ?? []
  const trackedEvents = analysis?.trackedEvents ?? []

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку экспериментов
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEdit}
          title="Редактировать эксперимент"
          aria-label="Редактировать эксперимент"
        >
          <Pencil className="size-4" />
          Редактировать
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold">
          {analysis?.experimentName ?? experimentMeta?.name ?? 'Эксперимент'}
        </h2>
        {experimentMeta?.description?.trim() && (
          <p className="mt-1 text-sm text-muted-foreground">
            {experimentMeta.description}
          </p>
        )}
        {experimentMeta && (
          <p className="mt-2 text-xs text-muted-foreground">
            Статус: {EXPERIMENT_STATUS_LABELS[experimentMeta.status]}
          </p>
        )}
      </div>

      {trackedEvents.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium">Отслеживаемые события</h3>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            {trackedEvents.join(' · ')}
          </p>
        </section>
      )}

      {(isLoading || isFetching) && !analysis && (
        <p className="text-sm text-muted-foreground">Расчёт эксперимента…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить аналитику. Проверьте настройки эксперимента.
        </p>
      )}

      {analysis && (
        <section className="space-y-4">
          <h3 className="text-sm font-medium">Результаты по вариантам</h3>
          <p className="text-xs text-muted-foreground">
            Учитываются все события проекта в базе. Exposed — пользователи с
            exposure-событием и property варианта; converted — все типы из
            списка.
          </p>

          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Вариантов нет.{' '}
              <button
                type="button"
                onClick={onEdit}
                className="text-primary underline underline-offset-4"
              >
                Добавьте группы
              </button>{' '}
              в редакторе.
            </p>
          ) : trackedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              События не заданы.{' '}
              <button
                type="button"
                onClick={onEdit}
                className="text-primary underline underline-offset-4"
              >
                Добавьте отслеживаемые события
              </button>{' '}
              в редакторе.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    <th className="px-4 py-3 font-medium">Вариант</th>
                    <th className="px-4 py-3 font-medium">Свойство</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Exposed
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Converted
                    </th>
                    <th className="px-4 py-3 font-medium text-right">
                      Конверсия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr
                      key={`${group.propertyKey}-${group.propertyValue}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{group.label}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {group.propertyKey}={group.propertyValue}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatUsersCount(group.exposed)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatUsersCount(group.converted)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-primary">
                        {formatPercent(group.conversionRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {experimentMeta?.result?.trim() && (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground">Итог</p>
              <p className="mt-1 text-sm">{experimentMeta.result}</p>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
