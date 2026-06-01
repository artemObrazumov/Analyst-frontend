import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addDashboardSeries } from 'src/api/dashboards'
import SeriesFiltersFields from 'src/components/dashboards/SeriesFiltersFields'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { SERIES_PERIOD_OPTIONS } from 'src/lib/series-period'
import {
  buildAddSeriesRequest,
  emptySeriesFiltersForm,
  validateSeriesFiltersForm,
} from 'src/lib/series-filters'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { DashboardSeriesPeriod } from 'src/types/dashboard'

interface AddDashboardSeriesDialogProps {
  projectId: string
  dashboardId: string
  open: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddDashboardSeriesDialog({
  projectId,
  dashboardId,
  open,
  onClose,
  onAdded,
}: AddDashboardSeriesDialogProps) {
  const [label, setLabel] = useState('')
  const [eventType, setEventType] = useState('')
  const [period, setPeriod] = useState<DashboardSeriesPeriod>('7d')
  const [filtersForm, setFiltersForm] = useState(emptySeriesFiltersForm)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      addDashboardSeries(
        projectId,
        dashboardId,
        buildAddSeriesRequest(label, period, eventType, filtersForm),
      ),
    onSuccess: () => {
      setLabel('')
      setEventType('')
      setPeriod('7d')
      setFiltersForm(emptySeriesFiltersForm())
      setError(null)
      onAdded()
      onClose()
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось добавить серию.',
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
      open={open}
      onClose={handleClose}
      title="Добавить серию"
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
          <label htmlFor="series-label" className="text-sm font-medium">
            Название
          </label>
          <input
            id="series-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Просмотры страниц"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="series-event-type" className="text-sm font-medium">
            Тип события
          </label>
          <input
            id="series-event-type"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="page_view"
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="series-period" className="text-sm font-medium">
            Период
          </label>
          <select
            id="series-period"
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
            {mutation.isPending ? 'Добавление…' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
