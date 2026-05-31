import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { createDashboard } from 'src/api/dashboards'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { DashboardResponse } from 'src/types/dashboard'

interface CreateDashboardDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
  onCreated: (dashboard: DashboardResponse) => void
}

export default function CreateDashboardDialog({
  projectId,
  open,
  onClose,
  onCreated,
}: CreateDashboardDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createDashboard(projectId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: (dashboard) => {
      setName('')
      setDescription('')
      setError(null)
      onCreated(dashboard)
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось создать дэшборд.',
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
      title="Создать дэшборд"
      dismissible={!mutation.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!name.trim()) {
            setError('Укажите название дэшборда.')
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
          <label htmlFor="dashboard-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="dashboard-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Обзор"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="dashboard-description" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="dashboard-description"
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
