import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { GripVertical, Trash2 } from 'lucide-react'
import { deleteFunnelStep, reorderFunnelSteps } from 'src/api/funnels'
import { Button } from 'src/components/ui/button'
import { arrayMove } from 'src/lib/array-move'
import { funnelStepDisplayTitle } from 'src/lib/funnel-step-display'
import { useNotifyStore } from 'src/stores/notify.store'
import type { FunnelStepResponse } from 'src/types/funnel'

interface FunnelStepsListProps {
  projectId: string
  funnelId: string
  steps: FunnelStepResponse[]
}

export default function FunnelStepsList({
  projectId,
  funnelId,
  steps,
}: FunnelStepsListProps) {
  const queryClient = useQueryClient()
  const pushNotify = useNotifyStore((s) => s.push)
  const [orderedSteps, setOrderedSteps] = useState(steps)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    setOrderedSteps(steps)
  }, [steps])

  const deleteMutation = useMutation({
    mutationFn: (stepId: string) =>
      deleteFunnelStep(projectId, funnelId, stepId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['funnel', projectId, funnelId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['funnels', projectId],
      })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (stepIds: string[]) =>
      reorderFunnelSteps(projectId, funnelId, { stepIds }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['funnel', projectId, funnelId],
      })
    },
    onError: () => {
      setOrderedSteps(steps)
      pushNotify('Не удалось изменить порядок шагов.', 'error')
    },
  })

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) return
    const newSteps = arrayMove(orderedSteps, dragIndex, dropIndex)
    setOrderedSteps(newSteps)
    setDragIndex(null)
    reorderMutation.mutate(newSteps.map((s) => s.id))
  }

  function handleDelete(step: FunnelStepResponse) {
    const title = funnelStepDisplayTitle(step.eventType, step.propertyFilters)
    const confirmed = window.confirm(`Удалить шаг «${title}»?`)
    if (confirmed) deleteMutation.mutate(step.id)
  }

  if (orderedSteps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Шагов пока нет. Добавьте первый шаг ниже — без шагов аналитика воронки
        будет пустой.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {orderedSteps.map((step, index) => (
        <li
          key={step.id}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleDrop(index)
          }}
          onDragEnd={() => setDragIndex(null)}
          className={`flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 ${
            dragIndex === index ? 'opacity-60' : ''
          }`}
        >
          <span
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-hidden
          >
            <GripVertical className="size-4" />
          </span>
          <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium font-mono">
              {funnelStepDisplayTitle(step.eventType, step.propertyFilters)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(step)}
            disabled={deleteMutation.isPending || reorderMutation.isPending}
            aria-label="Удалить шаг"
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
      {reorderMutation.isPending && (
        <p className="text-xs text-muted-foreground">Сохранение порядка…</p>
      )}
    </ul>
  )
}
