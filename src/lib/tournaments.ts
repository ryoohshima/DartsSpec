import type { Tournament } from '@/content/tournaments'

export type TournamentPeriod = 'upcoming' | 'past' | 'all'

const JAPAN_DATE_FORMAT = new Intl.DateTimeFormat('en', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
})

export function japanDate(now = new Date()): string {
  const parts = JAPAN_DATE_FORMAT.formatToParts(now)
  const value = (type: string) => parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}

export function filterTournaments(
  tournaments: readonly Tournament[],
  filters: { period: TournamentPeriod; tour: string; prefecture: string },
  today: string,
): Tournament[] {
  return tournaments.filter((event) =>
    (filters.period === 'all' || (filters.period === 'upcoming' ? event.date >= today : event.date < today)) &&
    (!filters.tour || event.tour === filters.tour) &&
    (!filters.prefecture || event.prefecture === filters.prefecture),
  ).sort((a, b) => filters.period === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
}
