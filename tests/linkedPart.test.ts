import { describe, expect, test } from 'vitest'
import { findLinkedPart } from '@/lib/linkedPart'
import type { PartOption } from '@/server/parts'

const part = (overrides: Partial<PartOption>): PartOption =>
  ({
    id: 'id',
    category: 'shaft',
    brand: 'CONDOR',
    series: 'AXE',
    name: 'Standard S',
    standard: null,
    spec: {},
    ...overrides,
  }) as PartOption

const condorShaft = part({ id: 's1', category: 'shaft', spec: { weight_g: 1.2, length_mm: 21.5 } })
const condorFlight = part({ id: 'f1', category: 'flight', spec: { weight_g: 0 } })
const lShaft = part({ id: 's2', brand: 'L-style', series: 'L-Shaft', name: 'Lock 260' })
const lFlight = part({ id: 'f2', category: 'flight', brand: 'L-style', series: 'L-Flight', name: 'PRO スタンダード' })

const all = [condorShaft, condorFlight, lShaft, lFlight]

describe('findLinkedPart', () => {
  test('shaft から brand・series・name 一致の flight を見つける', () => {
    expect(findLinkedPart(condorShaft, all)).toBe(condorFlight)
  })

  test('flight から対の shaft を見つける（双方向）', () => {
    expect(findLinkedPart(condorFlight, all)).toBe(condorShaft)
  })

  test('対のない通常パーツは null', () => {
    expect(findLinkedPart(lShaft, all)).toBeNull()
    expect(findLinkedPart(lFlight, all)).toBeNull()
  })

  test('series 違いは対とみなさない', () => {
    const otherSeries = part({ id: 'f3', category: 'flight', series: 'AXE 2' })
    expect(findLinkedPart(condorShaft, [condorShaft, otherSeries])).toBeNull()
  })

  test('shaft / flight 以外や未選択は null', () => {
    expect(findLinkedPart(part({ category: 'barrel' }), all)).toBeNull()
    expect(findLinkedPart(null, all)).toBeNull()
  })
})
