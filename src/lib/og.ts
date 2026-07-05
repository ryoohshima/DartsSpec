import { loadGoogleFont } from 'workers-og'
import { partDisplayName } from '@/lib/partName'

/**
 * OGP 画像（1200×630）の HTML とフォントを組み立てる（docs/03 §6.3 で確定したレイアウト）。
 *
 * フォント戦略: 日本語全字形の base64 埋め込みは Workers 無料枠（3MB gzip）に収まらないため、
 * Google Fonts の `text=` サブセット API で「描画する文字だけ」を毎回取得する。
 * 生成結果は Cloudflare Cache に載る（#38）ため、フォント取得はキャッシュミス時のみ発生する。
 */

const COLOR = {
  bgBase: '#0A0A0F',
  bgSurface: '#14141C',
  textPrimary: '#F5F5F7',
  textSecondary: '#9A9AAF',
  border: '#2A2A38',
  accent: '#00E5C7',
} as const

export type OgPart = { brand: string; series?: string | null; name: string } | null

export type OgSettingInput = {
  title: string
  authorName: string | null
  totalWeightG: number | null
  totalLengthMm: number | null
  parts: { barrel: OgPart; shaft: OgPart; flight: OgPart; tip: OgPart }
}

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function formatValue(value: number | null): string {
  return value === null ? '—' : value.toFixed(1)
}

function partRow(label: string, part: OgPart): string {
  const text = part
    ? `<span style="color: ${COLOR.textSecondary};">${escapeHtml(part.brand)}</span>
       <span style="color: ${COLOR.textPrimary}; margin-left: 16px;">${escapeHtml(partDisplayName(part))}</span>`
    : `<span style="color: ${COLOR.textSecondary};">—</span>`
  return `
    <div style="display: flex; align-items: baseline; font-size: 26px; margin-top: 14px;">
      <span style="color: ${COLOR.accent}; font-size: 20px; width: 140px; letter-spacing: 2px;">${label}</span>
      ${text}
    </div>`
}

export function buildOgHtml(setting: OgSettingInput): string {
  const author = setting.authorName
    ? `<span style="color: ${COLOR.textSecondary}; font-size: 20px;">by ${escapeHtml(setting.authorName)}</span>`
    : ''

  return `
  <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; padding: 64px; background: linear-gradient(135deg, ${COLOR.bgBase} 0%, ${COLOR.bgSurface} 100%); font-family: 'NotoSansJP';">
    <div style="display: flex; color: ${COLOR.accent}; font-size: 24px; font-weight: 700;">🎯 darts spec</div>
    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-top: 28px;">
      <span style="color: ${COLOR.textPrimary}; font-size: 44px; font-weight: 700; max-width: 900px; overflow: hidden;">${escapeHtml(setting.title)}</span>
      ${author}
    </div>
    <div style="display: flex; align-items: baseline; margin-top: 24px;">
      <span style="color: ${COLOR.textPrimary}; font-size: 96px; font-weight: 700;">${formatValue(setting.totalWeightG)}</span>
      <span style="color: ${COLOR.textSecondary}; font-size: 40px; margin-left: 8px;">g</span>
      <span style="color: ${COLOR.border}; font-size: 64px; margin: 0 32px;">/</span>
      <span style="color: ${COLOR.textPrimary}; font-size: 96px; font-weight: 700;">${formatValue(setting.totalLengthMm)}</span>
      <span style="color: ${COLOR.textSecondary}; font-size: 40px; margin-left: 8px;">mm</span>
    </div>
    <div style="display: flex; flex-direction: column; margin-top: 32px; border-top: 2px solid ${COLOR.border}; padding-top: 18px;">
      ${partRow('BARREL', setting.parts.barrel)}
      ${partRow('SHAFT', setting.parts.shaft)}
      ${partRow('FLIGHT', setting.parts.flight)}
      ${partRow('TIP', setting.parts.tip)}
    </div>
  </div>`
}

/** 汎用のサービス OGP（非公開・削除済みセッティング用のフォールバック、docs/03 §6.4） */
export function buildFallbackOgHtml(): string {
  return `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 1200px; height: 630px; background: linear-gradient(135deg, ${COLOR.bgBase} 0%, ${COLOR.bgSurface} 100%); font-family: 'NotoSansJP';">
    <div style="display: flex; color: ${COLOR.accent}; font-size: 48px; font-weight: 700;">🎯 darts spec</div>
    <div style="display: flex; color: ${COLOR.textPrimary}; font-size: 32px; margin-top: 24px;">ダーツのマイセッティングを、美しくシェアしよう。</div>
  </div>`
}

/** HTML から描画に必要な文字を抽出し、サブセットフォントを取得する */
export async function loadOgFonts(html: string) {
  // タグを除いた表示文字のみをサブセット対象にする（重複除去でクエリを短縮）
  const text = [...new Set(html.replace(/<[^>]*>/g, ''))].join('')
  const [regular, bold] = await Promise.all([
    loadGoogleFont({ family: 'Noto Sans JP', weight: 400, text }),
    loadGoogleFont({ family: 'Noto Sans JP', weight: 700, text }),
  ])
  return [
    { name: 'NotoSansJP', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'NotoSansJP', data: bold, weight: 700 as const, style: 'normal' as const },
  ]
}
