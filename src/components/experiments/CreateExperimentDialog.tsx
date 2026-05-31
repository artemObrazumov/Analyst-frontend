import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { createExperiment } from 'src/api/experiments'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { ExperimentResponse } from 'src/types/experiment'

interface CreateExperimentDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
  onCreated: (experiment: ExperimentResponse) => void
}

export default function CreateExperimentDialog({
  projectId,
  open,
  onClose,
  onCreated,
}: CreateExperimentDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createExperiment(projectId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: (experiment) => {
      setName('')
      setDescription('')
      setError(null)
      onCreated(experiment)
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось создать эксперимент.',
      )
    },
  })

  function handleClose() {
    if (mutation.isPending) return
    setError(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Создать эксперимент"
      dismissible={!mutation.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!name.trim()) {
            setError('Укажите название эксперимента.')
            return
          }
          mutation.mutate()
        }}
      >
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="experiment-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="experiment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Checkout layout A/B"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="experiment-description"
            className="text-sm font-medium"
          >
            Описание
          </label>
          <textarea
            id="experiment-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Необязательно"
            rows={3}
            className={inputClassName}
            disabled={mutation.isPending}
          />
        </div>

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
            {mutation.isPending ? 'Создание…' : 'Создать'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
