import type { ChartType } from 'src/types/dashboard'

export const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Линейный' },
  { value: 'bar', label: 'Столбцы' },
  { value: 'area', label: 'Область' },
]

export function chartTypeLabel(type: ChartType): string {
  return CHART_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type
}
