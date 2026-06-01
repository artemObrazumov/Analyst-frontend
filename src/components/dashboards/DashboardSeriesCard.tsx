import ReactECharts from 'echarts-for-react'
import type { DashboardSeriesWithData } from 'src/types/dashboard'
import { formatSeriesFiltersSummary } from 'src/lib/series-filters'
import { seriesPeriodLabel } from 'src/lib/series-period'

interface DashboardSeriesCardProps {
  series: DashboardSeriesWithData
}

function formatSeriesDate(isoDate: string): string {
  const [, m, d] = isoDate.split('-')
  return `${d}.${m}`
}

export default function DashboardSeriesCard({ series }: DashboardSeriesCardProps) {
  const filtersSummary = formatSeriesFiltersSummary(series)
  const dates = series.data.map((p) => formatSeriesDate(p.date))
  const counts = series.data.map((p) => p.count)
  const hasData = series.data.length > 0

  const option = {
    grid: { left: 48, right: 16, top: 24, bottom: 32 },
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { fontSize: 11 },
    },
    yAxis: {
      type: 'value' as const,
      min: 0,
      minInterval: 1,
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: 'line' as const,
        data: counts,
        smooth: true,
        itemStyle: { color: '#4f5bd5' },
      },
    ],
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <h4 className="font-medium">{series.label}</h4>
        <p className="font-mono text-xs text-muted-foreground">
          {series.eventType} · {seriesPeriodLabel(series.period)}
          {filtersSummary && (
            <>
              <span className="mx-1">·</span>
              <span className="font-sans">{filtersSummary}</span>
            </>
          )}
        </p>
      </div>
      {hasData ? (
        <ReactECharts
          option={option}
          style={{ height: 240, width: '100%' }}
          notMerge
          lazyUpdate
        />
      ) : (
        <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
          Нет данных за выбранный период
        </div>
      )}
    </div>
  )
}
