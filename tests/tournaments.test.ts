import { describe, expect, it } from 'vitest'
import { TOURNAMENTS } from '@/content/tournaments'
import { filterTournaments, japanDate } from '@/lib/tournaments'

const all = { period: 'all', tour: '', prefecture: '' } as const

describe('tournament dates and filters', () => {
  it('changes date at midnight in Japan, regardless of the host timezone', () => {
    expect(japanDate(new Date('2026-11-27T14:59:59Z'))).toBe('2026-11-27')
    expect(japanDate(new Date('2026-11-27T15:00:00Z'))).toBe('2026-11-28')
    expect(japanDate(new Date('2026-12-31T15:00:00Z'))).toBe('2027-01-01')
  })
  it('includes today and sorts upcoming dates without mutating editorial data', () => {
    const original = TOURNAMENTS.map((event) => event.id)
    const events = filterTournaments(TOURNAMENTS, { ...all, period: 'upcoming' }, '2026-11-28')
    expect(events[0].id).toBe('perfect-2026-18')
    expect(events).toHaveLength(6)
    expect(TOURNAMENTS.map((event) => event.id)).toEqual(original)
    expect(filterTournaments(TOURNAMENTS, { ...all, period: 'upcoming' }, '2027-03-21')).toEqual([])
  })
  it('excludes today from past dates and shows most recent dates first', () => {
    const events = filterTournaments(TOURNAMENTS, { ...all, period: 'past' }, '2026-11-28')
    expect(events.map((event) => event.date)).toEqual(['2026-11-08', '2026-10-31'])
  })
  it('combines tour, prefecture and period, including empty results', () => {
    expect(filterTournaments(TOURNAMENTS, { ...all, tour: 'PERFECT', prefecture: '神奈川県' }, '2026-11-25')).toHaveLength(2)
    expect(filterTournaments(TOURNAMENTS, { period: 'upcoming', tour: 'PERFECT', prefecture: '神奈川県' }, '2026-11-25')).toHaveLength(1)
    expect(filterTournaments(TOURNAMENTS, { ...all, tour: 'JAPAN', prefecture: '茨城県' }, '2026-11-25')).toEqual([])
  })
  it('keeps editorial identifiers unique and dates and source links valid', () => {
    expect(new Set(TOURNAMENTS.map((event) => event.id)).size).toBe(TOURNAMENTS.length)
    for (const event of TOURNAMENTS) {
      expect(new Date(`${event.date}T00:00:00Z`).toISOString().slice(0, 10)).toBe(event.date)
      expect(event.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(new URL(event.source).protocol).toBe('https:')
    }
  })
})
