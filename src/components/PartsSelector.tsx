import { partDisplayName } from '@/lib/partName'
import type { PartOption } from '@/server/parts'

type PartsSelectorProps = {
  label: string
  options: PartOption[]
  value: string | null
  onChange: (id: string | null) => void
}

function optionLabel(part: PartOption): string {
  const specs: string[] = []
  if (typeof part.spec.weight_g === 'number') specs.push(`${part.spec.weight_g}g`)
  if (typeof part.spec.length_mm === 'number') specs.push(`${part.spec.length_mm}mm`)
  if (part.spec.shape) specs.push(part.spec.shape)
  if (part.standard) specs.push(part.standard)
  const name = partDisplayName(part)
  return specs.length ? `${name}（${specs.join(' / ')}）` : name
}

/** ブランドごとにグルーピングしたパーツ選択セレクトボックス */
export function PartsSelector({ label, options, value, onChange }: PartsSelectorProps) {
  const byBrand = new Map<string, PartOption[]>()
  for (const option of options) {
    const list = byBrand.get(option.brand) ?? []
    list.push(option)
    byBrand.set(option.brand, list)
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-secondary">{label}</span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="min-h-11 rounded-lg border border-line bg-surface px-3 py-3 outline-none focus:border-accent"
      >
        <option value="">未選択</option>
        {[...byBrand.entries()].map(([brand, list]) => (
          <optgroup key={brand} label={brand}>
            {list.map((part) => (
              <option key={part.id} value={part.id}>
                {optionLabel(part)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}
