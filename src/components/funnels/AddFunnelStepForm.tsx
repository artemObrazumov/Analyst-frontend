import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addFunnelStep } from 'src/api/funnels'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
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
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      addFunnelStep(projectId, funnelId, {
        eventType: eventType.trim(),
        label: label.trim(),
      }),
    onSuccess: () => {
      setEventType('')
      setLabel('')
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
        if (!label.trim()) {
          setError('Укажите подпись шага.')
          return
        }
        mutation.mutate()
      }}
    >
      <p className="text-sm font-medium">Добавить шаг</p>
      <p className="text-xs text-muted-foreground">
        Тип события должен совпадать с полем eventType при отправке через SDK
        (POST /api/events/ingest).
      </p>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
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
        <div className="space-y-1.5">
          <label htmlFor="step-label" className="text-sm text-muted-foreground">
            Подпись
          </label>
          <input
            id="step-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Просмотр главной"
            className={inputClassName}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление…' : 'Добавить шаг'}
      </Button>
    </form>
  )
}
