import type { PartOption } from '@/server/parts'

/**
 * フライト一体型（CONDOR 等）の対を探す。
 *
 * 一体型パーツは seed 上 shaft / flight 両カテゴリに brand・series・name
 * 完全一致で 2 行登録する規約（src/db/seed.ts 参照）。重量二重計上を避けるため
 * weight_g は shaft 行に持たせ、flight 行は 0 とする。
 */
export function findLinkedPart(
  part: PartOption | null | undefined,
  parts: PartOption[],
): PartOption | null {
  if (!part || (part.category !== 'shaft' && part.category !== 'flight')) return null
  const other = part.category === 'shaft' ? 'flight' : 'shaft'
  return (
    parts.find(
      (p) =>
        p.category === other &&
        p.brand === part.brand &&
        p.series === part.series &&
        p.name === part.name,
    ) ?? null
  )
}
