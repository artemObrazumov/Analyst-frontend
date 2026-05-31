import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addDashboardChart } from 'src/api/dashboards'
import ChartFiltersFields from 'src/components/dashboards/ChartFiltersFields'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { CHART_TYPE_OPTIONS } from 'src/lib/chart-labels'
import {
  buildChartFiltersFromForm,
  emptyChartFiltersForm,
  validateChartFiltersForm,
} from 'src/lib/chart-filters'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { ChartType } from 'src/types/dashboard'

interface AddDashboardChartDialogProps {
  projectId: string
  dashboardId: string
  open: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddDashboardChartDialog({
  projectId,
  dashboardId,
  open,
  onClose,
  onAdded,
}: AddDashboardChartDialogProps) {
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('')
  const [chartType, setChartType] = useState<ChartType>('line')
  const [filtersForm, setFiltersForm] = useState(emptyChartFiltersForm)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const filters = buildChartFiltersFromForm(filtersForm)
      return addDashboardChart(projectId, dashboardId, {
        title: title.trim(),
        eventType: eventType.trim(),
        chartType,
        ...(filters ? { filters } : {}),
      })
    },
    onSuccess: () => {
      setTitle('')
      setEventType('')
      setChartType('line')
      setFiltersForm(emptyChartFiltersForm())
      setError(null)
      onAdded()
      onClose()
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось добавить график.',
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
    if (!title.trim()) {
      setError('Укажите название графика.')
      return
    }
    if (!eventType.trim()) {
      setError('Укажите тип события.')
      return
    }
    const filterError = validateChartFiltersForm(filtersForm)
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
      title="Добавить график"
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
          <label htmlFor="chart-title" className="text-sm font-medium">
            Название
          </label>
          <input
            id="chart-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Просмотры страниц"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="chart-event-type" className="text-sm font-medium">
            Тип события
          </label>
          <input
            id="chart-event-type"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="page_view"
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="chart-type" className="text-sm font-medium">
            Тип графика
          </label>
          <select
            id="chart-type"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className={inputClassName}
            disabled={mutation.isPending}
          >
            {CHART_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <ChartFiltersFields
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
