import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { addExperimentGroup } from 'src/api/experiments'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'

interface AddExperimentGroupFormProps {
  projectId: string
  experimentId: string
}

export default function AddExperimentGroupForm({
  projectId,
  experimentId,
}: AddExperimentGroupFormProps) {
  const queryClient = useQueryClient()
  const [propertyKey, setPropertyKey] = useState('')
  const [propertyValue, setPropertyValue] = useState('')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      addExperimentGroup(projectId, experimentId, {
        propertyKey: propertyKey.trim(),
        propertyValue: propertyValue.trim(),
        label: label.trim(),
      }),
    onSuccess: () => {
      setPropertyKey('')
      setPropertyValue('')
      setLabel('')
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
          : 'Не удалось добавить вариант.',
      )
    },
  })

  return (
    <form
      className="mt-6 space-y-3 rounded-xl border border-dashed border-border p-4"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        if (!propertyKey.trim()) {
          setError('Укажите ключ свойства.')
          return
        }
        if (!propertyValue.trim()) {
          setError('Укажите значение варианта.')
          return
        }
        if (!label.trim()) {
          setError('Укажите название варианта.')
          return
        }
        mutation.mutate()
      }}
    >
      <p className="text-sm font-medium">Добавить вариант</p>
      <p className="text-xs text-muted-foreground">
        Вариант определяется парой в JSON properties ingest-события, например
        checkout_layout = scroll.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label
            htmlFor="group-property-key"
            className="text-sm text-muted-foreground"
          >
            Ключ свойства
          </label>
          <input
            id="group-property-key"
            type="text"
            value={propertyKey}
            onChange={(e) => setPropertyKey(e.target.value)}
            placeholder="checkout_layout"
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="group-property-value"
            className="text-sm text-muted-foreground"
          >
            Значение
          </label>
          <input
            id="group-property-value"
            type="text"
            value={propertyValue}
            onChange={(e) => setPropertyValue(e.target.value)}
            placeholder="scroll"
            className={`${inputClassName} font-mono`}
            disabled={mutation.isPending}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="group-label" className="text-sm text-muted-foreground">
            Название
          </label>
          <input
            id="group-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Одностраничный checkout"
            className={inputClassName}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? 'Добавление…' : 'Добавить вариант'}
      </Button>
    </form>
  )
}
