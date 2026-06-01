export interface PropertyFilterRow {
  key: string
  value: string
}

export const emptyPropertyFilterRows = (): PropertyFilterRow[] => [
  { key: '', value: '' },
]

export function propertyFilterRowsFromMap(
  filters: Record<string, string> | null | undefined,
): PropertyFilterRow[] {
  if (!filters || Object.keys(filters).length === 0) {
    return emptyPropertyFilterRows()
  }
  return Object.entries(filters).map(([key, value]) => ({ key, value }))
}

export function buildPropertyFiltersMap(
  rows: PropertyFilterRow[],
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const row of rows) {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key && value) result[key] = value
  }
  return result
}

export function validatePropertyFilterRows(rows: PropertyFilterRow[]): string | null {
  for (const row of rows) {
    const key = row.key.trim()
    const value = row.value.trim()
    if ((key && !value) || (!key && value)) {
      return 'Укажите и ключ, и значение для свойства события.'
    }
  }
  return null
}

export function formatPropertyFiltersSummary(
  filters: Record<string, string> | null | undefined,
): string | null {
  if (!filters || Object.keys(filters).length === 0) return null
  const parts = Object.entries(filters)
    .filter(([key, value]) => key && value)
    .map(([key, value]) => `${key}=${value}`)
  return parts.length > 0 ? parts.join(' · ') : null
}
