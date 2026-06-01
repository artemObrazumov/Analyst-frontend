import type { DashboardSeriesPeriod } from 'src/types/dashboard'

export const SERIES_PERIOD_OPTIONS: {
  value: DashboardSeriesPeriod
  label: string
}[] = [
  { value: '7d', label: '7 дней' },
  { value: '30d', label: '30 дней' },
  { value: '90d', label: '90 дней' },
]

export function seriesPeriodLabel(period: DashboardSeriesPeriod): string {
  return SERIES_PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period
}
