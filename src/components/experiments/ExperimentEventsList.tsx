import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { deleteExperimentEvent } from 'src/api/experiments'
import { Button } from 'src/components/ui/button'
import type { ExperimentEventResponse } from 'src/types/experiment'

interface ExperimentEventsListProps {
  projectId: string
  experimentId: string
  events: ExperimentEventResponse[]
}

export default function ExperimentEventsList({
  projectId,
  experimentId,
  events,
}: ExperimentEventsListProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) =>
      deleteExperimentEvent(projectId, experimentId, eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['experiment', projectId, experimentId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiment-analysis', projectId, experimentId],
      })
    },
  })

  function handleDelete(event: ExperimentEventResponse) {
    const confirmed = window.confirm(
      `Удалить отслеживание события «${event.eventType}»?`,
    )
    if (confirmed) deleteMutation.mutate(event.id)
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        События не заданы. Добавьте типы событий ниже — без них конверсия не
        считается.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-medium">
              {event.eventType}
            </p>
            {event.note?.trim() && (
              <p className="truncate text-xs text-muted-foreground">
                {event.note}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(event)}
            disabled={deleteMutation.isPending}
            aria-label="Удалить событие"
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
