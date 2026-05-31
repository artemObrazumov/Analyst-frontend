import type { ChartFilters } from 'src/types/dashboard'

const PLATFORM_LABELS: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
}

export interface ChartFiltersFormState {
  platform: string
  country: string
  deviceId: string
  userId: string
  appVersion: string
  osVersion: string
  propertyRows: { key: string; value: string }[]
}

export const emptyChartFiltersForm = (): ChartFiltersFormState => ({
  platform: '',
  country: '',
  deviceId: '',
  userId: '',
  appVersion: '',
  osVersion: '',
  propertyRows: [{ key: '', value: '' }],
})

export function buildChartFiltersFromForm(
  form: ChartFiltersFormState,
): ChartFilters | undefined {
  const filters: ChartFilters = {}

  const platform = form.platform.trim()
  if (platform) filters.platform = platform

  const country = form.country.trim().toUpperCase()
  if (country) filters.country = country

  const deviceId = form.deviceId.trim()
  if (deviceId) filters.deviceId = deviceId

  const userId = form.userId.trim()
  if (userId) filters.userId = userId

  const appVersion = form.appVersion.trim()
  if (appVersion) filters.appVersion = appVersion

  const osVersion = form.osVersion.trim()
  if (osVersion) filters.osVersion = osVersion

  const properties: Record<string, string> = {}
  for (const row of form.propertyRows) {
    const key = row.key.trim()
    const value = row.value.trim()
    if (key && value) properties[key] = value
  }
  if (Object.keys(properties).length > 0) {
    filters.properties = properties
  }

  const hasProperties =
    filters.properties && Object.keys(filters.properties).length > 0
  const hasScalar = Boolean(
    filters.platform ||
      filters.country ||
      filters.deviceId ||
      filters.userId ||
      filters.appVersion ||
      filters.osVersion,
  )

  if (!hasScalar && !hasProperties) return undefined
  return filters
}

export function validateChartFiltersForm(form: ChartFiltersFormState): string | null {
  const country = form.country.trim()
  if (country && country.length !== 2) {
    return 'Код страны — ровно 2 буквы (ISO), например RU или US.'
  }

  for (const row of form.propertyRows) {
    const key = row.key.trim()
    const value = row.value.trim()
    if ((key && !value) || (!key && value)) {
      return 'Укажите и ключ, и значение для свойства события.'
    }
    if (key && value === '') {
      return 'Значение свойства не может быть пустым.'
    }
  }

  return null
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform
}

/** Краткая подпись фильтров для карточки графика: «iOS · US · plan=premium» */
export function formatChartFiltersSummary(
  filters: ChartFilters | null | undefined,
): string | null {
  if (!filters) return null

  const parts: string[] = []

  if (filters.platform) parts.push(platformLabel(filters.platform))
  if (filters.country) parts.push(filters.country.toUpperCase())
  if (filters.deviceId) parts.push(`device: ${filters.deviceId}`)
  if (filters.userId) parts.push(`user: ${filters.userId}`)
  if (filters.appVersion) parts.push(`v${filters.appVersion}`)
  if (filters.osVersion) parts.push(`OS ${filters.osVersion}`)

  const props = filters.properties
  if (props && typeof props === 'object') {
    for (const [key, value] of Object.entries(props)) {
      if (key && value) parts.push(`${key}=${value}`)
    }
  }

  return parts.length > 0 ? parts.join(' · ') : null
}
