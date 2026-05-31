import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addExperimentEvent } from 'src/api/experiments'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'

interface AddExperimentEventFormProps {
  projectId: string
  experimentId: string
}

export default function AddExperimentEventForm({
  projectId,
  experimentId,
}: AddExperimentEventFormProps) {
  const queryClient = useQueryClient()
  const [eventType, setEventType] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      addExperimentEvent(projectId, experimentId, {
        eventType: eventType.trim(),
        note: note.trim() || null,
      }),
    onSuccess: () => {
      setEventType('')
      setNote('')
      setError(null)
      void queryClient.invalidateQueries({
        queryKey: ['experiment', projectId, experimentId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiment-analysis', projectId, experimentId],
      })
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось добавить событие.',
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
        mutation.mutate()
      }}
    >
      <p className="text-sm font-medium">Добавить событие</p>
      <p className="text-xs text-muted-foreground">
        Тип должен совпадать с eventType при ingest. Для конверсии нужны все
        перечисленные типы у пользователя из exposed.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="exp-event-type"
            className="text-sm text-muted-foreground"
          >
            Тип события
          </label>
          <input
            id="exp-event-type"
            type="text"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="checkout_completed"
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="exp-event-note" className="text-sm text-muted-foreground">
            Комментарий
          </label>
          <input
            id="exp-event-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Конверсия"
            className={inputClassName}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление…' : 'Добавить событие'}
      </Button>
    </form>
  )
}
