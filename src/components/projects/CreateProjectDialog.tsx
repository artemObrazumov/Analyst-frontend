import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { createProject } from 'src/api/projects'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { toUserMessage } from 'src/lib/user-messages'
import type { ProjectWithKeyResponse } from 'src/types/project'

interface CreateProjectDialogProps {
  open: boolean
  onClose: () => void
  onCreated: (result: ProjectWithKeyResponse) => void
}

export default function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createProject({
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: (result) => {
      setName('')
      setDescription('')
      setError(null)
      onCreated(result)
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось создать проект.',
      )
    },
  })

  function handleClose() {
    if (mutation.isPending) return
    setError(null)
    onClose()
  }

  const inputClassName =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Создать проект"
      dismissible={!mutation.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!name.trim()) {
            setError('Укажите название проекта.')
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
          <label htmlFor="project-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Моё приложение"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="project-description" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="project-description"
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
