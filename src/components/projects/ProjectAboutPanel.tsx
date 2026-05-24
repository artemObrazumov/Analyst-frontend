import { formatDateTime } from 'src/lib/format-date'
import type { ProjectResponse } from 'src/types/project'

interface ProjectAboutPanelProps {
  project: ProjectResponse
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-4 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  )
}

export default function ProjectAboutPanel({ project }: ProjectAboutPanelProps) {
  return (
    <div className="max-w-2xl">
      <h2 className="mb-6 text-xl font-semibold">О проекте</h2>
      <dl>
        <InfoRow label="Название" value={project.name} />
        <InfoRow
          label="Описание"
          value={project.description?.trim() || '—'}
        />
        <InfoRow label="Идентификатор" value={project.id} />
        <InfoRow label="Создан" value={formatDateTime(project.createdAt)} />
        <InfoRow
          label="Обновлён"
          value={formatDateTime(project.updatedAt)}
        />
      </dl>
    </div>
  )
}
