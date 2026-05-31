import type { ExperimentStatus } from 'src/types/experiment'

export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  draft: 'Черновик',
  active: 'Активен',
  archived: 'В архиве',
}

export const EXPERIMENT_STATUS_OPTIONS: {
  value: ExperimentStatus
  label: string
}[] = [
  { value: 'draft', label: EXPERIMENT_STATUS_LABELS.draft },
  { value: 'active', label: EXPERIMENT_STATUS_LABELS.active },
  { value: 'archived', label: EXPERIMENT_STATUS_LABELS.archived },
]
