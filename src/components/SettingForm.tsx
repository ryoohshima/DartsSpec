import { useMemo, useState } from 'react'
import type { PartCategory } from '@/db/schema'
import { calcSpec } from '@/lib/calcSpec'
import { findLinkedPart } from '@/lib/linkedPart'
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

type PartIdKey = 'barrelId' | 'shaftId' | 'flightId' | 'tipId'

const SELECTOR_DEFS: Array<{ category: PartCategory; label: string; key: PartIdKey }> = [
  { category: 'barrel', label: 'バレル', key: 'barrelId' },
  { category: 'shaft', label: 'シャフト', key: 'shaftId' },
  { category: 'flight', label: 'フライト', key: 'flightId' },
  { category: 'tip', label: 'チップ', key: 'tipId' },
]

const cardPart = (part: PartOption | null) =>
  part ? { brand: part.brand, series: part.series, name: part.name } : null

const tabClass = (active: boolean) =>
  `flex-1 rounded-lg px-3 py-2 text-sm transition-colors ${
    active ? 'bg-accent font-bold text-base' : 'text-secondary hover:text-primary'
  }`

type SettingFormProps = {
  partsList: PartOption[]
  values: SettingFormValues
  onChange: (values: SettingFormValues) => void
  onSubmit: () => void
  submitLabel: string
  submitting: boolean
  error?: string | null
  /** 未ログイン時の注記（非ログインお試し・docs/content/01 §4.3） */
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
  // モバイルは入力とプレビューをタブで切り替える（lg 以上は 2 カラムで常時表示）
  const [mobileTab, setMobileTab] = useState<'input' | 'preview'>('input')

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

  // フライト一体型（shaft/flight 2 行登録）は片方の選択・解除をもう片方へ連動させる
  const handlePartChange = (def: (typeof SELECTOR_DEFS)[number], id: string | null) => {
    const next = { ...values, [def.key]: id }
    if (def.category === 'shaft' || def.category === 'flight') {
      const otherKey = def.category === 'shaft' ? 'flightId' : 'shaftId'
      const newPair = findLinkedPart(id ? byId.get(id) : null, partsList)
      if (newPair) {
        next[otherKey] = newPair.id
      } else {
        const prevPair = findLinkedPart(selectedPart(values[def.key]), partsList)
        if (prevPair && values[otherKey] === prevPair.id) next[otherKey] = null
      }
    }
    onChange(next)
  }

  const titleError = touched && values.title.trim() === '' ? 'セッティング名を入力してください' : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (values.title.trim() === '') return
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <div
        role="tablist"
        aria-label="入力とプレビューの切り替え"
        className="flex gap-1 rounded-xl border border-line bg-surface p-1 lg:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'input'}
          onClick={() => setMobileTab('input')}
          className={tabClass(mobileTab === 'input')}
        >
          入力
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'preview'}
          onClick={() => setMobileTab('preview')}
          className={tabClass(mobileTab === 'preview')}
        >
          プレビュー
        </button>
      </div>

      <div
        className={`min-w-0 flex-col gap-4 ${mobileTab === 'input' ? 'flex' : 'hidden'} lg:flex`}
      >
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

        {SELECTOR_DEFS.map((def) => (
          <PartsSelector
            key={def.category}
            label={def.label}
            options={byCategory.get(def.category) ?? []}
            value={values[def.key]}
            onChange={(id) => handlePartChange(def, id)}
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

      <div className={`${mobileTab === 'preview' ? 'block' : 'hidden'} lg:block`}>
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
