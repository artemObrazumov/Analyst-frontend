import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { ApiError } from 'src/api/errors'
import { deleteFunnel, getFunnel, updateFunnel } from 'src/api/funnels'
import AddFunnelStepForm from 'src/components/funnels/AddFunnelStepForm'
import FunnelStepsList from 'src/components/funnels/FunnelStepsList'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'

interface FunnelDetailViewProps {
  projectId: string
  funnelId: string
  onBack: () => void
  onDeleted: () => void
}

export default function FunnelDetailView({
  projectId,
  funnelId,
  onBack,
  onDeleted,
}: FunnelDetailViewProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const { data: funnel, isLoading, isError } = useQuery({
    queryKey: ['funnel', projectId, funnelId],
    queryFn: () => getFunnel(projectId, funnelId),
  })

  useEffect(() => {
    if (funnel) {
      setName(funnel.name)
      setDescription(funnel.description ?? '')
      setDirty(false)
    }
  }, [funnel])

  const updateMutation = useMutation({
    mutationFn: () =>
      updateFunnel(projectId, funnelId, {
        name: name.trim(),
        description: description.trim() || null,
      }),
    onSuccess: () => {
      setSaveError(null)
      setDirty(false)
      void queryClient.invalidateQueries({
        queryKey: ['funnel', projectId, funnelId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['funnels', projectId],
      })
    },
    onError: (err) => {
      setSaveError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось сохранить изменения.',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteFunnel(projectId, funnelId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['funnels', projectId],
      })
      onDeleted()
    },
  })

  function handleDelete() {
    const confirmed = window.confirm(
      'Удалить воронку и все её шаги? Это действие нельзя отменить.',
    )
    if (confirmed) deleteMutation.mutate()
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    if (!name.trim()) {
      setSaveError('Укажите название воронки.')
      return
    }
    updateMutation.mutate()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка воронки…</p>
  }

  if (isError || !funnel) {
    return (
      <div className="space-y-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку воронок
        </Button>
        <p className="text-sm text-destructive">Не удалось загрузить воронку.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку воронок
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="size-4" />
          Удалить
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-xl font-semibold">Редактирование воронки</h2>

        {saveError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="edit-funnel-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="edit-funnel-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setDirty(true)
            }}
            className={inputClassName}
            disabled={updateMutation.isPending}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-funnel-description" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="edit-funnel-description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setDirty(true)
            }}
            rows={2}
            className={inputClassName}
            disabled={updateMutation.isPending}
          />
        </div>

        {dirty && (
          <Button type="submit" size="sm" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Сохранение…' : 'Сохранить'}
          </Button>
        )}
      </form>

      <section>
        <h3 className="mb-1 text-lg font-semibold">Шаги</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Перетащите шаги, чтобы изменить порядок. Порядок сохраняется
          автоматически.
        </p>

        <FunnelStepsList
          projectId={projectId}
          funnelId={funnelId}
          steps={funnel.steps}
        />

        <AddFunnelStepForm projectId={projectId} funnelId={funnelId} />
      </section>
    </div>
  )
}
