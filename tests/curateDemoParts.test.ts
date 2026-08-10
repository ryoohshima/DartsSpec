import { describe, expect, test } from 'vitest'
import { curateDemoParts } from '@/lib/curateDemoParts'
import type { PartOption } from '@/server/parts'

function part(overrides: Partial<PartOption> & { brand: string; name: string }): PartOption {
  return {
    id: overrides.name,
    category: 'barrel',
    series: null,
    standard: null,
    spec: {},
    ...overrides,
  }
}

describe('curateDemoParts', () => {
  test('ブランドが重複するパーツは先に出てきたものだけを残す', () => {
    const options = [
      part({ brand: 'TRiNiDAD', name: 'Gomez Type8' }),
      part({ brand: 'TRiNiDAD', name: 'GARO Basic' }),
      part({ brand: 'TARGET', name: 'RVB' }),
    ]

    const result = curateDemoParts(options, 4)

    expect(result.map((p) => p.name)).toEqual(['Gomez Type8', 'RVB'])
  })

  test('limit を超えるユニークブランドがある場合は先頭から limit 件に切り詰める', () => {
    const options = [
      part({ brand: 'A', name: 'a' }),
      part({ brand: 'B', name: 'b' }),
      part({ brand: 'C', name: 'c' }),
      part({ brand: 'D', name: 'd' }),
      part({ brand: 'E', name: 'e' }),
    ]

    const result = curateDemoParts(options, 4)

    expect(result.map((p) => p.brand)).toEqual(['A', 'B', 'C', 'D'])
  })

  test('空配列を渡すと空配列を返す', () => {
    expect(curateDemoParts([], 4)).toEqual([])
  })
})
