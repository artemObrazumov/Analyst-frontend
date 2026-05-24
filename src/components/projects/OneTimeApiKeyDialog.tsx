import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import Modal from 'src/components/ui/Modal'
import { Button } from 'src/components/ui/button'
import type { ApiKeyCreatedResponse } from 'src/types/project'

interface OneTimeApiKeyDialogProps {
  open: boolean
  apiKey: ApiKeyCreatedResponse | null
  onClose: () => void
  /** Текст предупреждения (создание / ротация) */
  warning?: string
}

export default function OneTimeApiKeyDialog({
  open,
  apiKey,
  onClose,
  warning = 'API-ключ показывается один раз. Сохраните его для SDK — заголовок X-API-Key при отправке событий на POST /api/events/ingest.',
}: OneTimeApiKeyDialogProps) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!apiKey) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(apiKey!.key)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard недоступен */
    }
  }

  function handleClose() {
    setSaved(false)
    setCopied(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={undefined}
      title="Сохраните API-ключ"
      dismissible={false}
      className="max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{warning}</p>

        <div className="rounded-lg border border-border bg-muted/50 p-3">
          <code className="block break-all text-xs">{apiKey.key}</code>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleCopy()}
        >
          {copied ? (
            <>
              <Check className="size-4" />
              Скопировано
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Скопировать ключ
            </>
          )}
        </Button>

        <label className="flex cursor-pointer items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            className="mt-0.5"
          />
          <span>Я сохранил ключ</span>
        </label>

        <Button
          type="button"
          className="w-full"
          disabled={!saved}
          onClick={handleClose}
        >
          Готово
        </Button>
      </div>
    </Modal>
  )
}
