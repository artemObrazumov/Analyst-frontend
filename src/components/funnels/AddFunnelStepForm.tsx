import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addFunnelStep } from 'src/api/funnels'
import PropertyFilterRowsEditor from 'src/components/funnels/PropertyFilterRowsEditor'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import {
  buildPropertyFiltersMap,
  emptyPropertyFilterRows,
  validatePropertyFilterRows,
} from 'src/lib/property-filters'
import { toUserMessage } from 'src/lib/user-messages'

interface AddFunnelStepFormProps {
  projectId: string
  funnelId: string
}

export default function AddFunnelStepForm({
  projectId,
  funnelId,
}: AddFunnelStepFormProps) {
  const queryClient = useQueryClient()
  const [eventType, setEventType] = useState('')
  const [propertyRows, setPropertyRows] = useState(emptyPropertyFilterRows())
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      const propertyFilters = buildPropertyFiltersMap(propertyRows)
      return addFunnelStep(projectId, funnelId, {
        eventType: eventType.trim(),
        ...(Object.keys(propertyFilters).length > 0 ? { propertyFilters } : {}),
      })
    },
    onSuccess: () => {
      setEventType('')
      setPropertyRows(emptyPropertyFilterRows())
      setError(null)
      void queryClient.invalidateQueries({
        queryKey: ['funnel', projectId, funnelId],
      })
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось добавить шаг.',
      )
    },
  })

  return (
    <form
      className="mt-6 space-y-3 rounded-xl border border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        if (!eventType.trim()) {
          setError('Укажите тип события.')
          return
        }
        const rowError = validatePropertyFilterRows(propertyRows)
        if (rowError) {
          setError(rowError)
          return
        }
        mutation.mutate()
      }}
    >
      <p className="text-sm font-medium">Добавить шаг</p>
      <p className="text-xs text-muted-foreground">
        Тип события должен совпадать с eventType при ingest. Свойства в шаге
        сужают выборку (AND).
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-1.5">
        <label htmlFor="step-event-type" className="text-sm text-muted-foreground">
          Тип события
        </label>
        <input
          id="step-event-type"
          type="text"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          placeholder="page_view"
          className={`${inputClassName} font-mono`}
          disabled={mutation.isPending}
        />
      </div>

      <PropertyFilterRowsEditor
        rows={propertyRows}
        onChange={setPropertyRows}
        disabled={mutation.isPending}
      />

      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление…' : 'Добавить шаг'}
      </Button>
    </form>
  )
}
