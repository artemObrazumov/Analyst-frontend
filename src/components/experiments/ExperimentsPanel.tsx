import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { listExperiments } from 'src/api/experiments'
import CreateExperimentDialog from 'src/components/experiments/CreateExperimentDialog'
import ExperimentAnalyzeView from 'src/components/experiments/ExperimentAnalyzeView'
import ExperimentDetailView from 'src/components/experiments/ExperimentDetailView'
import { Button } from 'src/components/ui/button'
import { EXPERIMENT_STATUS_LABELS } from 'src/lib/experiment-status'
import type { ExperimentResponse } from 'src/types/experiment'

type ExperimentScreen =
  | { experimentId: string; mode: 'analyze' }
  | { experimentId: string; mode: 'edit' }
  | null

interface ExperimentsPanelProps {
  projectId: string
}

export default function ExperimentsPanel({ projectId }: ExperimentsPanelProps) {
  const queryClient = useQueryClient()
  const [screen, setScreen] = useState<ExperimentScreen>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: experiments = [], isLoading, isError } = useQuery({
    queryKey: ['experiments', projectId],
    queryFn: () => listExperiments(projectId),
  })

  function handleCreated(experiment: ExperimentResponse) {
    queryClient.setQueryData<ExperimentResponse[]>(
      ['experiments', projectId],
      (old) => [experiment, ...(old ?? [])],
    )
    setCreateOpen(false)
    setScreen({ experimentId: experiment.id, mode: 'edit' })
  }

  if (screen?.mode === 'analyze') {
    return (
      <ExperimentAnalyzeView
        projectId={projectId}
        experimentId={screen.experimentId}
        onBack={() => setScreen(null)}
        onEdit={() =>
          setScreen({ experimentId: screen.experimentId, mode: 'edit' })
        }
      />
    )
  }

  if (screen?.mode === 'edit') {
    return (
      <ExperimentDetailView
        projectId={projectId}
        experimentId={screen.experimentId}
        onBack={() => setScreen(null)}
        onDeleted={() => setScreen(null)}
        onAnalyze={() =>
          setScreen({ experimentId: screen.experimentId, mode: 'analyze' })
        }
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Эксперименты</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A/B-тесты по свойствам событий и конверсии между вариантами.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Создать эксперимент
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка экспериментов…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить эксперименты.
        </p>
      )}

      {!isLoading && !isError && experiments.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Экспериментов пока нет. Создайте первый эксперимент.
        </p>
      )}

      {experiments.length > 0 && (
        <div className="space-y-2">
          {experiments.map((experiment) => (
            <div
              key={experiment.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card pr-2 transition-colors hover:bg-muted/50"
            >
              <button
                type="button"
                onClick={() =>
                  setScreen({ experimentId: experiment.id, mode: 'analyze' })
                }
                className="flex min-w-0 flex-1 items-center gap-6 px-5 py-4 text-left"
              >
                <span className="shrink-0 font-medium">{experiment.name}</span>
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {experiment.description?.trim() || 'Без описания'}
                </span>
                <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {EXPERIMENT_STATUS_LABELS[experiment.status]}
                </span>
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() =>
                  setScreen({ experimentId: experiment.id, mode: 'edit' })
                }
                title="Редактировать"
                aria-label="Редактировать эксперимент"
                className="shrink-0 border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 hover:text-primary"
              >
                <Pencil className="size-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateExperimentDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
