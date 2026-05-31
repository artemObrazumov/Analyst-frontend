import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { deleteExperimentGroup } from 'src/api/experiments'
import { Button } from 'src/components/ui/button'
import type { ExperimentGroupResponse } from 'src/types/experiment'

interface ExperimentGroupsListProps {
  projectId: string
  experimentId: string
  groups: ExperimentGroupResponse[]
}

export default function ExperimentGroupsList({
  projectId,
  experimentId,
  groups,
}: ExperimentGroupsListProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (groupId: string) =>
      deleteExperimentGroup(projectId, experimentId, groupId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['experiment', projectId, experimentId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiment-analysis', projectId, experimentId],
      })
    },
  })

  function handleDelete(group: ExperimentGroupResponse) {
    const confirmed = window.confirm(
      `Удалить вариант «${group.label}» (${group.propertyKey}=${group.propertyValue})?`,
    )
    if (confirmed) deleteMutation.mutate(group.id)
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Вариантов пока нет. Добавьте группы A/B ниже — без них анализ будет
        пустым.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {groups.map((group) => (
        <li
          key={group.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{group.label}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {group.propertyKey} = {group.propertyValue}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => handleDelete(group)}
            disabled={deleteMutation.isPending}
            aria-label="Удалить вариант"
          >
            <Trash2 className="size-4" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
