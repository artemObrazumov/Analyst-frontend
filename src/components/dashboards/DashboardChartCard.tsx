import ReactECharts from 'echarts-for-react'
import type { DashboardChartWithData } from 'src/types/dashboard'
import { chartTypeLabel } from 'src/lib/chart-labels'
import { formatChartFiltersSummary } from 'src/lib/chart-filters'

interface DashboardChartCardProps {
  chart: DashboardChartWithData
}

function formatChartDate(isoDate: string): string {
  const [, m, d] = isoDate.split('-')
  return `${d}.${m}`
}

export default function DashboardChartCard({ chart }: DashboardChartCardProps) {
  const filtersSummary = formatChartFiltersSummary(chart.filters)
  const dates = chart.data.map((p) => formatChartDate(p.date))
  const counts = chart.data.map((p) => p.count)
  const hasData = chart.data.length > 0

  const seriesType =
    chart.chartType === 'area' ? 'line' : chart.chartType

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
      minInterval: 1,
      axisLabel: { fontSize: 11 },
    },
    series: [
      {
        type: seriesType,
        data: counts,
        smooth: chart.chartType === 'line',
        areaStyle: chart.chartType === 'area' ? { opacity: 0.25 } : undefined,
        itemStyle: { color: '#4f5bd5' },
      },
    ],
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3">
        <h4 className="font-medium">{chart.title}</h4>
        <p className="font-mono text-xs text-muted-foreground">
          {chart.eventType} · {chartTypeLabel(chart.chartType)}
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
