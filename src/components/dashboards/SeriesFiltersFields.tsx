import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import type { SeriesFiltersFormState } from 'src/lib/series-filters'

const PLATFORM_OPTIONS = [
  { value: '', label: 'Не выбрано' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
] as const

interface SeriesFiltersFieldsProps {
  form: SeriesFiltersFormState
  onChange: (form: SeriesFiltersFormState) => void
  disabled?: boolean
}

export default function SeriesFiltersFields({
  form,
  onChange,
  disabled,
}: SeriesFiltersFieldsProps) {
  const [open, setOpen] = useState(false)

  function updateField<K extends keyof SeriesFiltersFormState>(
    key: K,
    value: SeriesFiltersFormState[K],
  ) {
    onChange({ ...form, [key]: value })
  }

  function updatePropertyRow(index: number, key: string, value: string) {
    const rows = [...form.propertyRows]
    rows[index] = { key, value }
    onChange({ ...form, propertyRows: rows })
  }

  function addPropertyRow() {
    onChange({
      ...form,
      propertyRows: [...form.propertyRows, { key: '', value: '' }],
    })
  }

  function removePropertyRow(index: number) {
    const rows = form.propertyRows.filter((_, i) => i !== index)
    onChange({
      ...form,
      propertyRows: rows.length > 0 ? rows : [{ key: '', value: '' }],
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Фильтры</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          onClick={() => setOpen((v) => !v)}
          disabled={disabled}
          aria-expanded={open}
          aria-label={open ? 'Свернуть фильтры' : 'Развернуть фильтры'}
        >
          <ChevronDown
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>

      {open && (
        <div className="space-y-4 rounded-lg border border-border bg-background p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="series-filter-platform"
                className="text-xs text-muted-foreground"
              >
                Платформа
              </label>
              <select
                id="series-filter-platform"
                value={form.platform}
                onChange={(e) => updateField('platform', e.target.value)}
                className={inputClassName}
                disabled={disabled}
              >
                {PLATFORM_OPTIONS.map((o) => (
                  <option key={o.value || 'none'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="series-filter-country"
                className="text-xs text-muted-foreground"
              >
                Страна (ISO)
              </label>
              <input
                id="series-filter-country"
                type="text"
                value={form.country}
                onChange={(e) =>
                  updateField('country', e.target.value.toUpperCase())
                }
                placeholder="RU"
                maxLength={2}
                className={`${inputClassName} uppercase`}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="series-filter-app-version"
                className="text-xs text-muted-foreground"
              >
                Версия приложения
              </label>
              <input
                id="series-filter-app-version"
                type="text"
                value={form.appVersion}
                onChange={(e) => updateField('appVersion', e.target.value)}
                placeholder="1.2.0"
                className={inputClassName}
                disabled={disabled}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="series-filter-os-version"
                className="text-xs text-muted-foreground"
              >
                Версия ОС
              </label>
              <input
                id="series-filter-os-version"
                type="text"
                value={form.osVersion}
                onChange={(e) => updateField('osVersion', e.target.value)}
                placeholder="17.0"
                className={inputClassName}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Свойства события
            </p>
            {form.propertyRows.map((row, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={row.key}
                  onChange={(e) =>
                    updatePropertyRow(index, e.target.value, row.value)
                  }
                  placeholder="ключ"
                  className={`${inputClassName} font-mono`}
                  disabled={disabled}
                />
                <input
                  type="text"
                  value={row.value}
                  onChange={(e) =>
                    updatePropertyRow(index, row.key, e.target.value)
                  }
                  placeholder="значение"
                  className={inputClassName}
                  disabled={disabled}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removePropertyRow(index)}
                  disabled={disabled || form.propertyRows.length <= 1}
                  aria-label="Удалить свойство"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPropertyRow}
              disabled={disabled}
            >
              <Plus className="size-4" />
              Добавить свойство
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
