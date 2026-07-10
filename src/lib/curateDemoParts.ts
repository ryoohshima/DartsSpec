import type { PartOption } from '@/server/parts'

/**
 * LP のインタラクティブデモ用に、ブランドが重複しない代表パーツを先頭から選ぶ。
 * seed データはブランドごとに連続しているため、単純な先頭スライスだと
 * 同一ブランドばかりになってしまうのを避ける。
 */
export function curateDemoParts(options: PartOption[], limit = 4): PartOption[] {
  const seenBrands = new Set<string>()
  const curated: PartOption[] = []

  for (const option of options) {
    if (seenBrands.has(option.brand)) continue
    seenBrands.add(option.brand)
    curated.push(option)
    if (curated.length >= limit) break
  }

  return curated
}
