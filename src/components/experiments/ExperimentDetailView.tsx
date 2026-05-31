import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BarChart3, Trash2 } from 'lucide-react'
import { ApiError } from 'src/api/errors'
import {
  deleteExperiment,
  getExperiment,
  updateExperiment,
  updateExperimentStatus,
} from 'src/api/experiments'
import AddExperimentEventForm from 'src/components/experiments/AddExperimentEventForm'
import AddExperimentGroupForm from 'src/components/experiments/AddExperimentGroupForm'
import ExperimentEventsList from 'src/components/experiments/ExperimentEventsList'
import ExperimentGroupsList from 'src/components/experiments/ExperimentGroupsList'
import { Button } from 'src/components/ui/button'
import { EXPERIMENT_STATUS_OPTIONS } from 'src/lib/experiment-status'
import { inputClassName } from 'src/lib/form-styles'
import { toUserMessage } from 'src/lib/user-messages'
import type { ExperimentStatus } from 'src/types/experiment'

interface ExperimentDetailViewProps {
  projectId: string
  experimentId: string
  onBack: () => void
  onDeleted: () => void
  onAnalyze: () => void
}

export default function ExperimentDetailView({
  projectId,
  experimentId,
  onBack,
  onDeleted,
  onAnalyze,
}: ExperimentDetailViewProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [result, setResult] = useState('')
  const [status, setStatus] = useState<ExperimentStatus>('draft')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const { data: experiment, isLoading, isError } = useQuery({
    queryKey: ['experiment', projectId, experimentId],
    queryFn: () => getExperiment(projectId, experimentId),
  })

  useEffect(() => {
    if (experiment) {
      setName(experiment.name)
      setDescription(experiment.description ?? '')
      setResult(experiment.result ?? '')
      setStatus(experiment.status)
      setDirty(false)
    }
  }, [experiment])

  const updateMutation = useMutation({
    mutationFn: () =>
      updateExperiment(projectId, experimentId, {
        name: name.trim(),
        description: description.trim() || null,
        result: result.trim() || null,
      }),
    onSuccess: () => {
      setSaveError(null)
      setDirty(false)
      void queryClient.invalidateQueries({
        queryKey: ['experiment', projectId, experimentId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiments', projectId],
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

  const statusMutation = useMutation({
    mutationFn: (next: ExperimentStatus) =>
      updateExperimentStatus(projectId, experimentId, { status: next }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['experiment', projectId, experimentId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiments', projectId],
      })
      void queryClient.invalidateQueries({
        queryKey: ['experiment-analysis', projectId, experimentId],
      })
    },
    onError: (err) => {
      setSaveError(
        err instanceof ApiError
          ? toUserMessage(err)
          : 'Не удалось изменить статус.',
      )
      if (experiment) setStatus(experiment.status)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteExperiment(projectId, experimentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['experiments', projectId],
      })
      onDeleted()
    },
  })

  function handleDelete() {
    const confirmed = window.confirm(
      'Удалить эксперимент, все варианты и события? Это действие нельзя отменить.',
    )
    if (confirmed) deleteMutation.mutate()
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    if (!name.trim()) {
      setSaveError('Укажите название эксперимента.')
      return
    }
    updateMutation.mutate()
  }

  function handleStatusChange(next: ExperimentStatus) {
    setStatus(next)
    if (experiment && next !== experiment.status) {
      statusMutation.mutate(next)
    }
  }

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Загрузка эксперимента…</p>
    )
  }

  if (isError || !experiment) {
    return (
      <div className="space-y-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку экспериментов
        </Button>
        <p className="text-sm text-destructive">
          Не удалось загрузить эксперимент.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
          К списку экспериментов
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onAnalyze}>
            <BarChart3 className="size-4" />
            Анализ
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
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <h2 className="text-xl font-semibold">Редактирование эксперимента</h2>

        {saveError && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {saveError}
          </p>
        )}

        <div className="space-y-1.5">
          <label htmlFor="edit-exp-status" className="text-sm font-medium">
            Статус
          </label>
          <select
            id="edit-exp-status"
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as ExperimentStatus)
            }
            className={inputClassName}
            disabled={statusMutation.isPending}
          >
            {EXPERIMENT_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="edit-exp-name" className="text-sm font-medium">
            Название
          </label>
          <input
            id="edit-exp-name"
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
          <label htmlFor="edit-exp-description" className="text-sm font-medium">
            Описание
          </label>
          <textarea
            id="edit-exp-description"
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

        <div className="space-y-1.5">
          <label htmlFor="edit-exp-result" className="text-sm font-medium">
            Итог
          </label>
          <textarea
            id="edit-exp-result"
            value={result}
            onChange={(e) => {
              setResult(e.target.value)
              setDirty(true)
            }}
            rows={2}
            placeholder="Заметки по результатам A/B"
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
        <h3 className="mb-1 text-lg font-semibold">Варианты</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Группа сопоставляется с properties события при exposure.
        </p>
        <ExperimentGroupsList
          projectId={projectId}
          experimentId={experimentId}
          groups={experiment.groups}
        />
        <AddExperimentGroupForm
          projectId={projectId}
          experimentId={experimentId}
        />
      </section>

      <section>
        <h3 className="mb-1 text-lg font-semibold">Отслеживаемые события</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Уникальные пользователи с хотя бы одним событием из списка попадают в
          exposed; converted — если есть все типы из списка.
        </p>
        <ExperimentEventsList
          projectId={projectId}
          experimentId={experimentId}
          events={experiment.events}
        />
        <AddExperimentEventForm
          projectId={projectId}
          experimentId={experimentId}
        />
      </section>
    </div>
  )
}
