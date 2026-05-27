export function formatPercent(value: number): string {
  return `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%`
}

export function formatUsersCount(count: number): string {
  return count.toLocaleString('ru-RU')
}

export function formatDurationSeconds(seconds: number | null): string {
  if (seconds === null) return '—'
  if (seconds < 60) {
    return `${Math.round(seconds).toLocaleString('ru-RU')} с`
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60)
    return `${minutes.toLocaleString('ru-RU')} мин`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  if (minutes === 0) return `${hours.toLocaleString('ru-RU')} ч`
  return `${hours.toLocaleString('ru-RU')} ч ${minutes.toLocaleString('ru-RU')} мин`
}
