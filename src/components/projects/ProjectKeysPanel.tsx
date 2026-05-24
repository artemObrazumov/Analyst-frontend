import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from 'src/api/errors'
import { getProjectKeyMeta, rotateProjectKey } from 'src/api/projects'
import OneTimeApiKeyDialog from 'src/components/projects/OneTimeApiKeyDialog'
import { Button } from 'src/components/ui/button'
import { formatDateTime } from 'src/lib/format-date'
import type { ApiKeyCreatedResponse } from 'src/types/project'

interface ProjectKeysPanelProps {
  projectId: string
}

export default function ProjectKeysPanel({ projectId }: ProjectKeysPanelProps) {
  const queryClient = useQueryClient()
  const [rotatedKey, setRotatedKey] = useState<ApiKeyCreatedResponse | null>(
    null,
  )

  const {
    data: keyMeta,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['project', projectId, 'key'],
    queryFn: () => getProjectKeyMeta(projectId),
    retry: false,
  })

  const rotateMutation = useMutation({
    mutationFn: () => rotateProjectKey(projectId),
    onSuccess: (apiKey) => {
      setRotatedKey(apiKey)
      void queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'key'],
      })
    },
  })

  function handleRotate() {
    const confirmed = window.confirm(
      'Старый ключ перестанет работать в SDK и приложениях. Выпустить новый ключ?',
    )
    if (confirmed) rotateMutation.mutate()
  }

  const notFound =
    isError && error instanceof ApiError && error.status === 404

  return (
    <div className="max-w-2xl">
      <h2 className="mb-2 text-xl font-semibold">Ключи</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Полный ключ доступен только при создании проекта или ротации. Для
        приёма событий используйте заголовок X-API-Key.
      </p>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Загрузка…</p>
      )}

      {notFound && (
        <p className="text-sm text-muted-foreground">Активный ключ не найден.</p>
      )}

      {isError && !notFound && (
        <p className="text-sm text-destructive">
          Не удалось загрузить данные ключа.
        </p>
      )}

      {keyMeta && (
        <dl className="mb-6 rounded-xl border border-border bg-card">
          <div className="grid gap-1 border-b border-border px-4 py-3 sm:grid-cols-[160px_1fr]">
            <dt className="text-sm text-muted-foreground">Идентификатор</dt>
            <dd className="text-sm font-mono text-xs">{keyMeta.id}</dd>
          </div>
          <div className="grid gap-1 border-b border-border px-4 py-3 sm:grid-cols-[160px_1fr]">
            <dt className="text-sm text-muted-foreground">Статус</dt>
            <dd className="text-sm">
              {keyMeta.isActive ? 'Активен' : 'Неактивен'}
            </dd>
          </div>
          <div className="grid gap-1 border-b border-border px-4 py-3 sm:grid-cols-[160px_1fr]">
            <dt className="text-sm text-muted-foreground">Метка</dt>
            <dd className="text-sm">{keyMeta.label ?? '—'}</dd>
          </div>
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-[160px_1fr]">
            <dt className="text-sm text-muted-foreground">Создан</dt>
            <dd className="text-sm">{formatDateTime(keyMeta.createdAt)}</dd>
          </div>
        </dl>
      )}

      {keyMeta && (
        <Button
          type="button"
          variant="outline"
          onClick={handleRotate}
          disabled={rotateMutation.isPending}
        >
          {rotateMutation.isPending ? 'Ротация…' : 'Ротировать ключ'}
        </Button>
      )}

      <OneTimeApiKeyDialog
        open={rotatedKey !== null}
        apiKey={rotatedKey}
        onClose={() => setRotatedKey(null)}
        warning="Новый API-ключ показывается один раз. Обновите его во всех SDK и приложениях — старый ключ уже не принимает события."
      />
    </div>
  )
}
