export type DateRangePreset = '7d' | '30d' | '90d' | 'custom'

export interface DateRange {
  from: string
  to: string
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function rangeForPreset(preset: Exclude<DateRangePreset, 'custom'>): DateRange {
  const to = new Date()
  const from = new Date()
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90
  from.setDate(from.getDate() - days)
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

/** Даты из input type=date → ISO-8601 для query from/to */
export function dateRangeToIsoQuery(range: DateRange): {
  from: string
  to: string
} {
  const from = new Date(`${range.from}T00:00:00`)
  const to = new Date(`${range.to}T23:59:59.999`)
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

export function isDateRangeValid(range: DateRange): boolean {
  return range.from <= range.to
}
