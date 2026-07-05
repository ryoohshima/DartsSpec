import type { PartSpec } from '@/db/schema'

/**
 * 選択中のパーツスペック。未選択のスロットは null / undefined。
 */
export type SelectedSpecs = {
  barrel?: PartSpec | null
  shaft?: PartSpec | null
  flight?: PartSpec | null
  tip?: PartSpec | null
}

export type CalcSpecResult = {
  /** 総重量（g）。重量が分かるパーツが 1 つもなければ null */
  totalWeightG: number | null
  /** 全長（mm）。バレル・シャフトのどちらも未選択なら null */
  totalLengthMm: number | null
  /** 選択中パーツに未登録スペックがあり参考値であることを示す（docs/02 §4） */
  isApproximate: boolean
}

/** 浮動小数点誤差を丸める（表示は toFixed(1) を想定し 2 桁で保持） */
function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * スペック自動合算ロジック（docs/02 §4 が唯一の仕様）。
 *
 * - 総重量 = barrel.weight_g + (shaft.weight_g ?? 0) + (flight.weight_g ?? 0) + (tip.weight_g ?? 0)
 * - 全長   = barrel.length_mm + shaft.length_mm + (tip.length_mm ?? 0)（フライトは含めない）
 *
 * フロントのリアルタイム表示とサーバの保存時再計算で同一関数を共有する（docs/04 §5）。
 */
export function calcSpec(selected: SelectedSpecs): CalcSpecResult {
  const { barrel, shaft, flight, tip } = selected

  let weight = 0
  let weightCount = 0
  let isApproximate = false

  for (const spec of [barrel, shaft, flight, tip]) {
    if (!spec) continue
    if (typeof spec.weight_g === 'number') {
      weight += spec.weight_g
      weightCount++
    } else {
      isApproximate = true
    }
  }

  let length: number | null = null
  if (barrel || shaft) {
    length = 0
    for (const spec of [barrel, shaft, tip]) {
      if (!spec) continue
      if (typeof spec.length_mm === 'number') {
        length += spec.length_mm
      } else {
        isApproximate = true
      }
    }
  }

  return {
    totalWeightG: weightCount > 0 ? round(weight) : null,
    totalLengthMm: length !== null ? round(length) : null,
    isApproximate,
  }
}
