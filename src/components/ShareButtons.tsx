import { useEffect, useState } from 'react'

type ShareButtonsProps = {
  settingId: string
  title: string
  totalWeightG: number | null
  totalLengthMm: number | null
  /** 作成完了直後は最大サイズで表示する（docs/03 §5） */
  prominent?: boolean
}

function publicUrl(settingId: string): string {
  const site =
    import.meta.env.VITE_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${site}/s/${settingId}`
}

/** X Web Intent の定型文（docs/03 §5 で確定） */
function shareText(props: ShareButtonsProps): string {
  const lines = ['自分のダーツセッティングを晒してみた🎯', `「${props.title}」`]
  if (props.totalWeightG !== null || props.totalLengthMm !== null) {
    const weight = props.totalWeightG !== null ? `総重量 ${props.totalWeightG.toFixed(1)}g` : ''
    const length = props.totalLengthMm !== null ? `全長 ${props.totalLengthMm.toFixed(1)}mm` : ''
    lines.push([weight, length].filter(Boolean).join(' / '))
  }
  lines.push('', publicUrl(props.settingId), '#ダーツ #マイセッティング #dartsspec')
  return lines.join('\n')
}

export function ShareButtons(props: ShareButtonsProps) {
  const { prominent } = props
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleShare = () => {
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText(props))}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl(props.settingId))
    setCopied(true)
  }

  return (
    <div className={`flex gap-2 ${prominent ? 'flex-col' : 'flex-wrap items-center'}`}>
      <button
        type="button"
        onClick={handleShare}
        className={
          prominent
            ? 'min-h-12 w-full rounded-xl bg-accent px-6 py-3 text-lg font-bold text-base transition-opacity hover:opacity-90'
            : 'min-h-11 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base transition-opacity hover:opacity-90'
        }
      >
        X でシェア
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className={
          prominent
            ? 'min-h-12 w-full rounded-xl border border-line px-6 py-3 text-secondary transition-colors hover:text-primary'
            : 'min-h-11 rounded-lg border border-line px-4 py-2 text-sm text-secondary transition-colors hover:text-primary'
        }
      >
        {copied ? 'コピーしました ✓' : 'URL をコピー'}
      </button>
    </div>
  )
}
