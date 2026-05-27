import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { listFunnels } from 'src/api/funnels'
import CreateFunnelDialog from 'src/components/funnels/CreateFunnelDialog'
import FunnelAnalyzeView from 'src/components/funnels/FunnelAnalyzeView'
import FunnelDetailView from 'src/components/funnels/FunnelDetailView'
import { Button } from 'src/components/ui/button'
import type { FunnelResponse } from 'src/types/funnel'

type FunnelScreen =
  | { funnelId: string; mode: 'analyze' }
  | { funnelId: string; mode: 'edit' }
  | null

interface FunnelsPanelProps {
  projectId: string
}

export default function FunnelsPanel({ projectId }: FunnelsPanelProps) {
  const queryClient = useQueryClient()
  const [screen, setScreen] = useState<FunnelScreen>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: funnels = [], isLoading, isError } = useQuery({
    queryKey: ['funnels', projectId],
    queryFn: () => listFunnels(projectId),
  })

  function handleCreated(funnel: FunnelResponse) {
    queryClient.setQueryData<FunnelResponse[]>(['funnels', projectId], (old) => [
      funnel,
      ...(old ?? []),
    ])
    setCreateOpen(false)
    setScreen({ funnelId: funnel.id, mode: 'analyze' })
  }

  if (screen?.mode === 'analyze') {
    return (
      <FunnelAnalyzeView
        projectId={projectId}
        funnelId={screen.funnelId}
        onBack={() => setScreen(null)}
        onEdit={() => setScreen({ funnelId: screen.funnelId, mode: 'edit' })}
      />
    )
  }

  if (screen?.mode === 'edit') {
    return (
      <FunnelDetailView
        projectId={projectId}
        funnelId={screen.funnelId}
        onBack={() => setScreen(null)}
        onDeleted={() => setScreen(null)}
      />
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Воронки</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Последовательность типов событий для анализа конверсии.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Создать воронку
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка воронок…</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Не удалось загрузить воронки.
        </p>
      )}

      {!isLoading && !isError && funnels.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Воронок пока нет. Создайте первую воронку.
        </p>
      )}

      {funnels.length > 0 && (
        <div className="space-y-2">
          {funnels.map((funnel) => (
            <div
              key={funnel.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-card pr-2 transition-colors hover:bg-muted/50"
            >
              <button
                type="button"
                onClick={() => setScreen({ funnelId: funnel.id, mode: 'analyze' })}
                className="flex min-w-0 flex-1 items-center gap-6 px-5 py-4 text-left"
              >
                <span className="shrink-0 font-medium">{funnel.name}</span>
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                  {funnel.description?.trim() || 'Без описания'}
                </span>
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() => setScreen({ funnelId: funnel.id, mode: 'edit' })}
                title="Редактировать"
                aria-label="Редактировать воронку"
                className="shrink-0 border-primary/40 bg-primary/10 text-primary hover:border-primary hover:bg-primary/20 hover:text-primary"
              >
                <Pencil className="size-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <CreateFunnelDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
