import { Plus, Trash2 } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { inputClassName } from 'src/lib/form-styles'
import type { PropertyFilterRow } from 'src/lib/property-filters'

interface PropertyFilterRowsEditorProps {
  rows: PropertyFilterRow[]
  onChange: (rows: PropertyFilterRow[]) => void
  disabled?: boolean
}

export default function PropertyFilterRowsEditor({
  rows,
  onChange,
  disabled,
}: PropertyFilterRowsEditorProps) {
  function updateRow(index: number, key: string, value: string) {
    const next = [...rows]
    next[index] = { key, value }
    onChange(next)
  }

  function addRow() {
    onChange([...rows, { key: '', value: '' }])
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    onChange(next.length > 0 ? next : [{ key: '', value: '' }])
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Фильтры по свойствам события
      </p>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={row.key}
            onChange={(e) => updateRow(index, e.target.value, row.value)}
            placeholder="ключ"
            className={`${inputClassName} font-mono`}
            disabled={disabled}
          />
          <input
            type="text"
            value={row.value}
            onChange={(e) => updateRow(index, row.key, e.target.value)}
            placeholder="значение"
            className={inputClassName}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(index)}
            disabled={disabled || rows.length <= 1}
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
        onClick={addRow}
        disabled={disabled}
      >
        <Plus className="size-4" />
        Добавить свойство
      </Button>
    </div>
  )
}
