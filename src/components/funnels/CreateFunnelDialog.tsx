import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { createFunnel } from 'src/api/funnels'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { FunnelResponse } from 'src/types/funnel'

interface CreateFunnelDialogProps {
  projectId: string
  open: boolean
  onClose: () => void
  onCreated: (funnel: FunnelResponse) => void
}

export default function CreateFunnelDialog({
  projectId,
  open,
  onClose,
  onCreated,
}: CreateFunnelDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createFunnel(projectId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: (funnel) => {
      setName('')
      setDescription('')
      setError(null)
      onCreated(funnel)
    },
    onError: (err) => {
      setError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось создать воронку.',
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
      title="Создать воронку"
      dismissible={!mutation.isPending}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          if (!name.trim()) {
            setError('Укажите название воронки.')
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
          <label htmlFor="funnel-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="funnel-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Покупка"
            className={inputClassName}
            disabled={mutation.isPending}
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="funnel-description" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="funnel-description"
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
