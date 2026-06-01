import {
  buildPropertyFiltersMap,
  emptyPropertyFilterRows,
  formatPropertyFiltersSummary,
  propertyFilterRowsFromMap,
  validatePropertyFilterRows,
  type PropertyFilterRow,
} from 'src/lib/property-filters'
import type {
  AddDashboardSeriesRequest,
  DashboardSeriesPeriod,
  DashboardSeriesResponse,
  DashboardSeriesWithData,
  UpdateDashboardSeriesRequest,
} from 'src/types/dashboard'

const PLATFORM_LABELS: Record<string, string> = {
  ios: 'iOS',
  android: 'Android',
}

export interface SeriesFiltersFormState {
  platform: string
  country: string
  appVersion: string
  osVersion: string
  propertyRows: PropertyFilterRow[]
}

export const emptySeriesFiltersForm = (): SeriesFiltersFormState => ({
  platform: '',
  country: '',
  appVersion: '',
  osVersion: '',
  propertyRows: emptyPropertyFilterRows(),
})

export function seriesFiltersFormFromSeries(
  series: Pick<
    DashboardSeriesResponse,
    'platform' | 'country' | 'appVersion' | 'osVersion' | 'propertyFilters'
  >,
): SeriesFiltersFormState {
  return {
    platform: series.platform ?? '',
    country: series.country ?? '',
    appVersion: series.appVersion ?? '',
    osVersion: series.osVersion ?? '',
    propertyRows: propertyFilterRowsFromMap(series.propertyFilters),
  }
}

function applyFiltersToBody<T extends AddDashboardSeriesRequest | UpdateDashboardSeriesRequest>(
  body: T,
  form: SeriesFiltersFormState,
): T {
  const platform = form.platform.trim()
  if (platform) body.platform = platform

  const country = form.country.trim().toUpperCase()
  if (country) body.country = country

  const appVersion = form.appVersion.trim()
  if (appVersion) body.appVersion = appVersion

  const osVersion = form.osVersion.trim()
  if (osVersion) body.osVersion = osVersion

  const propertyFilters = buildPropertyFiltersMap(form.propertyRows)
  if (Object.keys(propertyFilters).length > 0) {
    body.propertyFilters = propertyFilters
  }

  return body
}

export function buildAddSeriesRequest(
  label: string,
  period: DashboardSeriesPeriod,
  eventType: string,
  form: SeriesFiltersFormState,
): AddDashboardSeriesRequest {
  return applyFiltersToBody(
    {
      label: label.trim(),
      period,
      eventType: eventType.trim(),
    },
    form,
  )
}

export function buildUpdateSeriesRequest(
  label: string,
  period: DashboardSeriesPeriod,
  eventType: string,
  form: SeriesFiltersFormState,
): UpdateDashboardSeriesRequest {
  return applyFiltersToBody(
    {
      label: label.trim(),
      period,
      eventType: eventType.trim(),
    },
    form,
  )
}

export function validateSeriesFiltersForm(
  form: SeriesFiltersFormState,
): string | null {
  const country = form.country.trim()
  if (country && country.length !== 2) {
    return 'Код страны — ровно 2 буквы (ISO), например RU или US.'
  }
  return validatePropertyFilterRows(form.propertyRows)
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform
}

export function formatSeriesFiltersSummary(
  series: Pick<
    DashboardSeriesResponse | DashboardSeriesWithData,
    'platform' | 'country' | 'appVersion' | 'osVersion' | 'propertyFilters'
  >,
): string | null {
  const parts: string[] = []

  if (series.platform) parts.push(platformLabel(series.platform))
  if (series.country) parts.push(series.country.toUpperCase())
  if (series.appVersion) parts.push(`v${series.appVersion}`)
  if (series.osVersion) parts.push(`OS ${series.osVersion}`)

  const propsSummary = formatPropertyFiltersSummary(series.propertyFilters)
  if (propsSummary) parts.push(propsSummary)

  return parts.length > 0 ? parts.join(' · ') : null
}
