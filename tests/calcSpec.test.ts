import { describe, expect, test } from 'vitest'
import { calcSpec } from '@/lib/calcSpec'

const barrel = { weight_g: 18.0, length_mm: 45.0, max_diameter_mm: 7.2 }
const shaft = { length_mm: 19.0, weight_g: 1.1, material: 'カーボン' }
const flight = { shape: 'スタンダード', weight_g: 0.68 }
const tip = { type: 'ソフト', length_mm: 25.0, weight_g: 0.25 }

describe('calcSpec', () => {
  test('全パーツ選択時に総重量・全長を正しく合算する', () => {
    const result = calcSpec({ barrel, shaft, flight, tip })

    expect(result.totalWeightG).toBe(20.03)
    // フライトは全長に含めない（docs/02 §4）
    expect(result.totalLengthMm).toBe(89.0)
    expect(result.isApproximate).toBe(false)
  })

  test('チップ無しの場合は全長がバレル + シャフトになる', () => {
    const result = calcSpec({ barrel, shaft, flight })

    expect(result.totalWeightG).toBe(19.78)
    expect(result.totalLengthMm).toBe(64.0)
    expect(result.isApproximate).toBe(false)
  })

  test('重量未登録のパーツは 0 として合算し参考値フラグを立てる', () => {
    const flightWithoutWeight = { shape: 'シェイプ' }
    const result = calcSpec({ barrel, shaft, flight: flightWithoutWeight, tip })

    expect(result.totalWeightG).toBe(19.35)
    expect(result.isApproximate).toBe(true)
  })

  test('チップの長さ未登録は 0 として全長を合算し参考値フラグを立てる', () => {
    const tipWithoutLength = { type: 'ソフト', weight_g: 0.25 }
    const result = calcSpec({ barrel, shaft, tip: tipWithoutLength })

    expect(result.totalLengthMm).toBe(64.0)
    expect(result.isApproximate).toBe(true)
  })

  test('浮動小数点の端数が丸められる', () => {
    const result = calcSpec({
      barrel: { weight_g: 17.95, length_mm: 40.1 },
      shaft: { length_mm: 20.2, weight_g: 1.15 },
    })

    expect(result.totalWeightG).toBe(19.1)
    expect(result.totalLengthMm).toBe(60.3)
  })

  test('バレルのみ選択時は全長がバレル単体長になる', () => {
    const result = calcSpec({ barrel })

    expect(result.totalWeightG).toBe(18.0)
    expect(result.totalLengthMm).toBe(45.0)
  })

  test('バレル・シャフトが未選択なら全長は null', () => {
    const result = calcSpec({ flight, tip })

    expect(result.totalLengthMm).toBeNull()
    expect(result.totalWeightG).toBe(0.93)
  })

  test('何も選択されていなければすべて null', () => {
    const result = calcSpec({})

    expect(result).toEqual({ totalWeightG: null, totalLengthMm: null, isApproximate: false })
  })

  test('重量が分かるパーツが 1 つもなければ総重量は null で参考値', () => {
    const result = calcSpec({ flight: { shape: 'スタンダード' } })

    expect(result.totalWeightG).toBeNull()
    expect(result.isApproximate).toBe(true)
  })
})
