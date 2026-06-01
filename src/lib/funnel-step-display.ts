import { formatPropertyFiltersSummary } from 'src/lib/property-filters'

/** Заголовок шага в UI: eventType + опциональные propertyFilters */
export function funnelStepDisplayTitle(
  eventType: string,
  propertyFilters: Record<string, string> | null | undefined,
): string {
  const filters = formatPropertyFiltersSummary(propertyFilters)
  if (filters) return `${eventType} · ${filters}`
  return eventType
}
