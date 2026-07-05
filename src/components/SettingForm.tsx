import { useMemo, useState } from 'react'
import type { PartCategory } from '@/db/schema'
import { calcSpec } from '@/lib/calcSpec'
import type { PartOption } from '@/server/parts'
import { PartsSelector } from '@/components/PartsSelector'
import { SettingCard } from '@/components/SettingCard'

export type SettingFormValues = {
  title: string
  barrelId: string | null
  shaftId: string | null
  flightId: string | null
  tipId: string | null
  visibility: 'public' | 'private'
}

export const EMPTY_SETTING: SettingFormValues = {
  title: '',
  barrelId: null,
  shaftId: null,
  flightId: null,
  tipId: null,
  visibility: 'public',
}

const SELECTOR_DEFS: Array<{ category: PartCategory; label: string; key: keyof SettingFormValues }> =
  [
    { category: 'barrel', label: 'バレル', key: 'barrelId' },
    { category: 'shaft', label: 'シャフト', key: 'shaftId' },
    { category: 'flight', label: 'フライト', key: 'flightId' },
    { category: 'tip', label: 'チップ', key: 'tipId' },
  ]

type SettingFormProps = {
  partsList: PartOption[]
  values: SettingFormValues
  onChange: (values: SettingFormValues) => void
  onSubmit: () => void
  submitLabel: string
  submitting: boolean
  error?: string | null
  /** 未ログイン時の注記（非ログインお試し・docs/01 §4.3） */
  guestNote?: string | null
}

/** セッティング作成・編集の共有フォーム（#28） */
export function SettingForm({
  partsList,
  values,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
  error,
  guestNote,
}: SettingFormProps) {
  const [touched, setTouched] = useState(false)

  const byCategory = useMemo(() => {
    const map = new Map<PartCategory, PartOption[]>()
    for (const part of partsList) {
      const list = map.get(part.category) ?? []
      list.push(part)
      map.set(part.category, list)
    }
    return map
  }, [partsList])

  const byId = useMemo(() => new Map(partsList.map((p) => [p.id, p])), [partsList])

  const selectedPart = (id: string | null) => (id ? (byId.get(id) ?? null) : null)
  const barrel = selectedPart(values.barrelId)
  const shaft = selectedPart(values.shaftId)
  const flight = selectedPart(values.flightId)
  const tip = selectedPart(values.tipId)

  const totals = calcSpec({
    barrel: barrel?.spec,
    shaft: shaft?.spec,
    flight: flight?.spec,
    tip: tip?.spec,
  })

  const titleError = touched && values.title.trim() === '' ? 'セッティング名を入力してください' : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (values.title.trim() === '') return
    onSubmit()
  }

  const cardPart = (part: PartOption | null) =>
    part ? { brand: part.brand, series: part.series, name: part.name } : null

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary">セッティング名</span>
          <input
            type="text"
            value={values.title}
            onChange={(e) => onChange({ ...values, title: e.target.value })}
            placeholder="例: 週末リーグ用セッティング"
            maxLength={100}
            className="rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
          />
          {titleError && <span className="text-xs text-danger">{titleError}</span>}
        </label>

        {SELECTOR_DEFS.map(({ category, label, key }) => (
          <PartsSelector
            key={category}
            label={label}
            options={byCategory.get(category) ?? []}
            value={values[key] as string | null}
            onChange={(id) => onChange({ ...values, [key]: id })}
          />
        ))}

        <label className="flex items-center gap-2 text-sm text-secondary">
          <input
            type="checkbox"
            checked={values.visibility === 'private'}
            onChange={(e) =>
              onChange({ ...values, visibility: e.target.checked ? 'private' : 'public' })
            }
            className="h-4 w-4 accent-[#00e5c7]"
          />
          非公開にする（自分だけが閲覧できます）
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {guestNote && <p className="text-sm text-secondary">{guestNote}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 min-h-11 rounded-xl bg-accent px-4 py-3 font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? '保存中…' : submitLabel}
        </button>
      </div>

      <div>
        <p className="mb-2 text-xs text-secondary">プレビュー</p>
        <SettingCard
          title={values.title}
          totalWeightG={totals.totalWeightG}
          totalLengthMm={totals.totalLengthMm}
          isApproximate={totals.isApproximate}
          animated
          parts={{
            barrel: cardPart(barrel),
            shaft: cardPart(shaft),
            flight: cardPart(flight),
            tip: cardPart(tip),
          }}
        />
      </div>
    </form>
  )
}
