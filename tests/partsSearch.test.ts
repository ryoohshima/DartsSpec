import { describe, expect, it } from 'vitest'
import { filterParts } from '@/lib/partsSearch'

const PARTS = [
  { brand: 'COSMO DARTS', series: '96', name: '96 黒瀧摩紀', standard: '2BA' },
  { brand: 'TARGET', series: 'RISING SUN', name: 'RISING SUN G8', standard: '2BA' },
  { brand: 'CONDOR', series: 'AXE', name: 'CONDOR AXE Small S', standard: null },
]

describe('filterParts', () => {
  it('空クエリは全件を返す', () => {
    expect(filterParts(PARTS, '')).toEqual(PARTS)
    expect(filterParts(PARTS, '  ')).toEqual(PARTS)
  })

  it('英字は大文字小文字を無視して一致する', () => {
    expect(filterParts(PARTS, 'cosmo')).toEqual([PARTS[0]])
  })

  it('ブランドのカナ別名に一致する（カタカナ・ひらがな両方）', () => {
    expect(filterParts(PARTS, 'コスモ')).toEqual([PARTS[0]])
    expect(filterParts(PARTS, 'こすも')).toEqual([PARTS[0]])
    expect(filterParts(PARTS, 'ターゲット')).toEqual([PARTS[1]])
  })

  it('製品名の日本語にも一致する', () => {
    expect(filterParts(PARTS, '黒瀧')).toEqual([PARTS[0]])
  })

  it('一致しないクエリは空配列を返す', () => {
    expect(filterParts(PARTS, '存在しないパーツ')).toEqual([])
  })
})
