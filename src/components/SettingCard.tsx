import type { ReactNode } from 'react'
import { AnimatedNumber } from '@/components/AnimatedNumber'
import { partDisplayName } from '@/lib/partName'

export type CardPart = {
  brand: string
  series?: string | null
  name: string
} | null

export type SettingCardProps = {
  title: string
  authorName?: string | null
  totalWeightG: number | null
  totalLengthMm: number | null
  isApproximate?: boolean
  parts: {
    barrel?: CardPart
    shaft?: CardPart
    flight?: CardPart
    tip?: CardPart
  }
  /** 作成画面のライブプレビューでは数値をアニメーションさせる */
  animated?: boolean
  footer?: ReactNode
}

const PART_ROWS = [
  ['BARREL', 'barrel'],
  ['SHAFT', 'shaft'],
  ['FLIGHT', 'flight'],
  ['TIP', 'tip'],
] as const

function SpecValue({
  value,
  unit,
  animated,
}: {
  value: number | null
  unit: string
  animated?: boolean
}) {
  return (
    <span className="numeric text-4xl font-bold sm:text-5xl">
      {value === null ? (
        <span className="text-secondary">—</span>
      ) : animated ? (
        <AnimatedNumber value={value} />
      ) : (
        value.toFixed(1)
      )}
      <span className="ml-1 text-base font-normal text-secondary">{unit}</span>
    </span>
  )
}

/** セッティングカード（docs/03 §4.2 で確定したレイアウト） */
export function SettingCard({
  title,
  authorName,
  totalWeightG,
  totalLengthMm,
  isApproximate,
  parts,
  animated,
  footer,
}: SettingCardProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
        My Setting
      </p>
      <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold sm:text-2xl">{title || '無題のセッティング'}</h2>
        {authorName && <p className="text-sm text-secondary">by {authorName}</p>}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 min-[320px]:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
            Total Weight
          </p>
          <SpecValue value={totalWeightG} unit="g" animated={animated} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
            Total Length
          </p>
          <SpecValue value={totalLengthMm} unit="mm" animated={animated} />
        </div>
      </div>
      {isApproximate && (
        <p className="mt-2 text-xs text-secondary">※ 一部スペック未登録のため参考値</p>
      )}

      <hr className="my-6 border-line" />

      <dl className="flex flex-col gap-3">
        {PART_ROWS.map(([label, key]) => {
          const part = parts[key]
          return (
            <div key={key} className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
                {label}
              </dt>
              <dd className="min-w-0 text-sm">
                {part ? (
                  <>
                    <span className="text-secondary">{part.brand}</span>{' '}
                    <span className="font-medium">{partDisplayName(part)}</span>
                  </>
                ) : (
                  <span className="text-secondary">未選択</span>
                )}
              </dd>
            </div>
          )
        })}
      </dl>

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  )
}
