import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'
import { getDashboardPage } from 'src/api/dashboards'
import DashboardSeriesCard from 'src/components/dashboards/DashboardSeriesCard'
import { Button } from 'src/components/ui/button'

interface DashboardPageViewProps {
  projectId: string
  dashboardId: string
  onBack: () => void
  onEdit: () => void
}

export default function DashboardPageView({
  projectId,
  dashboardId,
  onBack,
  onEdit,
}: DashboardPageViewProps) {
  const {
    data: page,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dashboard-page', projectId, dashboardId],
    queryFn: () => getDashboardPage(projectId, dashboardId),
  })

  const seriesList = [...(page?.series ?? [])].sort(
    (a, b) => a.position - b.position,
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
        <p className="mt-2 text-xs text-muted-foreground">
          Период задаётся отдельно для каждой серии (7 / 30 / 90 дней).
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка серий…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить дэшборд.
        </p>
      )}

      {page && !isLoading && (
        <section className="space-y-4">
          {seriesList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Серий пока нет.{' '}
              <button
                type="button"
                onClick={onEdit}
                className="text-primary underline underline-offset-4"
              >
                Добавьте серии
              </button>{' '}
              в редакторе.
            </p>
          ) : (
            <div className="grid gap-4">
              {seriesList.map((series) => (
                <DashboardSeriesCard key={series.id} series={series} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
