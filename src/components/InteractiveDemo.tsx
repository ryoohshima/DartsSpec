import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { PART_CATEGORIES } from '@/db/schema'
import type { PartCategory } from '@/db/schema'
import { calcSpec } from '@/lib/calcSpec'
import { curateDemoParts } from '@/lib/curateDemoParts'
import type { PartOption } from '@/server/parts'
import { SettingCard } from '@/components/SettingCard'

const CATEGORY_LABELS: Record<PartCategory, string> = {
  barrel: 'BARREL',
  shaft: 'SHAFT',
  flight: 'FLIGHT',
  tip: 'TIP',
}

type InteractiveDemoProps = {
  partsList: PartOption[]
}

/** LP のヒーロー直下に置く、パーツ選択で重量・全長がリアルタイムに変わる体験デモ */
export function InteractiveDemo({ partsList }: InteractiveDemoProps) {
  const byCategory = useMemo(() => {
    const map = new Map<PartCategory, PartOption[]>()
    for (const category of PART_CATEGORIES) {
      map.set(
        category,
        curateDemoParts(partsList.filter((part) => part.category === category)),
      )
    }
    return map
  }, [partsList])

  const [selected, setSelected] = useState<Record<PartCategory, string | null>>(() => {
    const initial = {} as Record<PartCategory, string | null>
    for (const category of PART_CATEGORIES) {
      initial[category] = byCategory.get(category)?.[0]?.id ?? null
    }
    return initial
  })

  const byId = useMemo(() => new Map(partsList.map((part) => [part.id, part])), [partsList])
  const selectedPart = (id: string | null) => (id ? (byId.get(id) ?? null) : null)

  const barrel = selectedPart(selected.barrel)
  const shaft = selectedPart(selected.shaft)
  const flight = selectedPart(selected.flight)
  const tip = selectedPart(selected.tip)

  const totals = calcSpec({
    barrel: barrel?.spec,
    shaft: shaft?.spec,
    flight: flight?.spec,
    tip: tip?.spec,
  })

  const cardPart = (part: PartOption | null) =>
    part ? { brand: part.brand, series: part.series, name: part.name } : null

  const toggle = (category: PartCategory, id: string) => {
    setSelected((prev) => ({ ...prev, [category]: prev[category] === id ? null : id }))
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-8 pb-24 lg:grid-cols-2"
    >
      <div className="flex flex-col gap-6">
        {PART_CATEGORIES.map((category) => (
          <div key={category}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-accent">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-wrap gap-2">
              {(byCategory.get(category) ?? []).map((part) => {
                const isSelected = selected[category] === part.id
                return (
                  <motion.button
                    key={part.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => toggle(category, part.id)}
                    className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-accent bg-accent text-base'
                        : 'border-line bg-surface text-secondary hover:text-primary'
                    }`}
                  >
                    {part.brand} {part.name}
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <SettingCard
        title="週末リーグ用セッティング"
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
        footer={
          <Link
            to="/settings/new"
            className="block min-h-12 w-full rounded-xl bg-accent px-6 py-3 text-center text-lg font-bold text-base transition-opacity hover:opacity-90"
          >
            自分のセッティングをつくってシェアする
          </Link>
        }
      />
    </motion.section>
  )
}
