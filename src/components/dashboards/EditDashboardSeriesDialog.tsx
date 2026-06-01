import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { updateDashboardSeries } from 'src/api/dashboards'
import SeriesFiltersFields from 'src/components/dashboards/SeriesFiltersFields'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { SERIES_PERIOD_OPTIONS } from 'src/lib/series-period'
import {
  buildUpdateSeriesRequest,
  seriesFiltersFormFromSeries,
  validateSeriesFiltersForm,
} from 'src/lib/series-filters'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type {
  DashboardSeriesPeriod,
  DashboardSeriesResponse,
} from 'src/types/dashboard'

interface EditDashboardSeriesDialogProps {
  projectId: string
  dashboardId: string
  series: DashboardSeriesResponse | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export default function EditDashboardSeriesDialog({
  projectId,
  dashboardId,
  series,
  open,
  onClose,
  onUpdated,
}: EditDashboardSeriesDialogProps) {
  const [label, setLabel] = useState('')
  const [eventType, setEventType] = useState('')
  const [period, setPeriod] = useState<DashboardSeriesPeriod>('7d')
  const [filtersForm, setFiltersForm] = useState(
    seriesFiltersFormFromSeries({
      platform: null,
      country: null,
      appVersion: null,
      osVersion: null,
      propertyFilters: {},
    }),
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (series && open) {
      setLabel(series.label)
      setEventType(series.eventType)
      setPeriod(series.period)
      setFiltersForm(seriesFiltersFormFromSeries(series))
      setError(null)
    }
  }, [series, open])

  const mutation = useMutation({
    mutationFn: () => {
      if (!series) throw new Error('Series is required')
      return updateDashboardSeries(
        projectId,
        dashboardId,
        series.id,
        buildUpdateSeriesRequest(label, period, eventType, filtersForm),
      )
    },
    onSuccess: () => {
      setError(null)
      onUpdated()
      onClose()
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось сохранить серию.',
      )
    },
  })

  function handleClose() {
    if (mutation.isPending) return
    setError(null)
    onClose()
  }

  function handleSubmit() {
    setError(null)
    if (!label.trim()) {
      setError('Укажите название серии.')
      return
    }
    if (!eventType.trim()) {
      setError('Укажите тип события.')
      return
    }
    const filterError = validateSeriesFiltersForm(filtersForm)
    if (filterError) {
      setError(filterError)
      return
    }
    mutation.mutate()
  }

  return (
    <Modal
      open={open && series !== null}
      onClose={handleClose}
      title="Редактировать серию"
      dismissible={!mutation.isPending}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="edit-series-label" className="text-sm font-medium">
            Название
          </label>
          <input
            id="edit-series-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-series-event-type" className="text-sm font-medium">
            Тип события
          </label>
          <input
            id="edit-series-event-type"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-series-period" className="text-sm font-medium">
            Период
          </label>
          <select
            id="edit-series-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardSeriesPeriod)}
            className={inputClassName}
            disabled={mutation.isPending}
          >
            {SERIES_PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <SeriesFiltersFields
          form={filtersForm}
          onChange={setFiltersForm}
          disabled={mutation.isPending}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
