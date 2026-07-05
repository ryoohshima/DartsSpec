/**
 * パーツマスタ seed スクリプト（docs/02 §5）。
 *
 * src/db/seed/parts.csv を読み込み、.seed/parts.sql（INSERT OR REPLACE 文）を生成する。
 * 実行: `pnpm db:seed`（生成 + ローカル D1 へ投入）
 * 本番: 生成された .seed/parts.sql を `wrangler d1 execute dartsspec --remote --file` で投入（#42）
 *
 * ID は内容（category / brand / name / standard / weight）から決定的に導出するため、
 * 再実行しても重複せず、CSV の更新分だけが上書きされる。
 *
 * 注意: parts.csv は Web 上の公称スペックを基にした開発用モックデータであり、
 * 一部の値は同シリーズの代表値で補完している。正式な品質チェックは #11 を参照。
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PartCategory, PartSpec } from './schema'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_PATH = join(__dirname, 'seed', 'parts.csv')
const OUT_PATH = join(__dirname, '..', '..', '.seed', 'parts.sql')

const CATEGORIES = new Set(['barrel', 'shaft', 'flight', 'tip'])

type CsvRow = Record<string, string>

/** RFC 4180 相当の簡易 CSV パーサ（二重引用符・引用符内カンマ / 改行対応） */
function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
    } else {
      field += c
    }
  }
  row.push(field)
  if (row.some((v) => v !== '')) rows.push(row)

  const [header, ...body] = rows
  if (!header) throw new Error(`CSV が空です: ${CSV_PATH}`)
  return body.map((cols) =>
    Object.fromEntries(header.map((h, i) => [h.trim(), (cols[i] ?? '').trim()])),
  )
}

function toNumber(value: string, context: string): number | undefined {
  if (value === '') return undefined
  const n = Number(value)
  if (!Number.isFinite(n)) throw new Error(`数値として解釈できません: ${context} = "${value}"`)
  return n
}

function buildSpec(row: CsvRow): PartSpec {
  const weight = toNumber(row.weight_g ?? '', `${row.name} weight_g`)
  const length = toNumber(row.length_mm ?? '', `${row.name} length_mm`)
  const diameter = toNumber(row.max_diameter_mm ?? '', `${row.name} max_diameter_mm`)

  switch (row.category as PartCategory) {
    case 'barrel': {
      if (weight === undefined || length === undefined) {
        throw new Error(`バレルは weight_g / length_mm が必須です: ${row.brand} ${row.name}`)
      }
      return {
        weight_g: weight,
        length_mm: length,
        ...(diameter !== undefined && { max_diameter_mm: diameter }),
        ...(row.material && { material: row.material }),
      }
    }
    case 'shaft': {
      if (length === undefined) {
        throw new Error(`シャフトは length_mm が必須です: ${row.brand} ${row.name}`)
      }
      return {
        length_mm: length,
        ...(weight !== undefined && { weight_g: weight }),
        ...(row.material && { material: row.material }),
      }
    }
    case 'flight': {
      if (!row.shape) {
        throw new Error(`フライトは shape が必須です: ${row.brand} ${row.name}`)
      }
      return {
        shape: row.shape,
        ...(row.thickness && { thickness: row.thickness }),
        ...(weight !== undefined && { weight_g: weight }),
      }
    }
    case 'tip': {
      if (!row.tip_type) {
        throw new Error(`チップは tip_type が必須です: ${row.brand} ${row.name}`)
      }
      return {
        type: row.tip_type,
        ...(length !== undefined && { length_mm: length }),
        ...(weight !== undefined && { weight_g: weight }),
      }
    }
  }
}

/** 内容から決定的な ID を導出する（再 seed の冪等性のため） */
function stableId(row: CsvRow): string {
  const key = [row.category, row.brand, row.series, row.name, row.standard, row.weight_g].join('|')
  return `seed-${createHash('sha256').update(key).digest('hex').slice(0, 24)}`
}

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

function main() {
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'))

  const seen = new Map<string, CsvRow>()
  for (const row of rows) {
    if (!CATEGORIES.has(row.category ?? '')) {
      throw new Error(`不明な category です: "${row.category}"（${row.brand} ${row.name}）`)
    }
    const id = stableId(row)
    const dup = seen.get(id)
    if (dup) {
      throw new Error(
        `重複レコードがあります: ${row.brand} ${row.name}（${row.category} / ${row.weight_g}g）`,
      )
    }
    seen.set(id, row)
  }

  const statements = [...seen.entries()].map(([id, row]) => {
    const spec = buildSpec(row)
    const values = [
      sqlString(id),
      sqlString(row.category),
      sqlString(row.brand),
      row.series ? sqlString(row.series) : 'NULL',
      sqlString(row.name),
      row.standard ? sqlString(row.standard) : 'NULL',
      sqlString(JSON.stringify(spec)),
      'NULL', // image_url（権利配慮のため収集しない・docs/02 §2）
      '1',
      "unixepoch()",
    ]
    return `INSERT OR REPLACE INTO parts (id, category, brand, series, name, standard, spec, image_url, is_active, created_at) VALUES (${values.join(', ')});`
  })

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, `${statements.join('\n')}\n`)

  const byCategory = new Map<string, number>()
  for (const row of seen.values()) {
    byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1)
  }
  console.log(`生成完了: ${OUT_PATH}（${seen.size} 件）`)
  for (const [category, count] of byCategory) {
    console.log(`  ${category}: ${count} 件`)
  }
}

main()
