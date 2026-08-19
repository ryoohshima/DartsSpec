/** カナ検索用のブランド別名（シードの全 16 ブランド分） */
const BRAND_KANA: Record<string, string> = {
  CONDOR: 'コンドル',
  'COSMO DARTS': 'コスモ コスモダーツ',
  'D.craft': 'ディークラフト',
  DMC: 'ディーエムシー',
  DYNASTY: 'ダイナスティー ダイナスティ',
  Harrows: 'ハローズ',
  'JOKER DRIVER': 'ジョーカードライバー ジョーカー',
  'L-style': 'エルスタイル',
  MONSTER: 'モンスター',
  One80: 'ワンエイティ',
  Samurai: 'サムライ',
  TARGET: 'ターゲット',
  TIGA: 'ティガ',
  TRiNiDAD: 'トリニダード',
  'ULTIMA DARTS': 'アルティマ アルティマダーツ',
  unicorn: 'ユニコーン',
}

/** ひらがなをカタカナへ寄せて小文字化する（「こすも」でもコスモ表記に一致させる） */
function normalizeQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ぁ-ん]/g, (c) => String.fromCharCode(c.charCodeAt(0) + 0x60))
}

type SearchablePart = {
  brand: string
  series?: string | null
  name: string
  standard?: string | null
}

/** キーワードでパーツを絞り込む（ブランドのカナ別名にも一致） */
export function filterParts<T extends SearchablePart>(parts: T[], query: string): T[] {
  const q = normalizeQuery(query.trim())
  if (!q) return parts
  return parts.filter((part) =>
    normalizeQuery(
      [part.brand, BRAND_KANA[part.brand], part.series, part.name, part.standard]
        .filter(Boolean)
        .join(' '),
    ).includes(q),
  )
}
