import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { InfoLayout } from '@/components/InfoLayout'
import { TOURNAMENTS } from '@/content/tournaments'
import { filterTournaments, japanDate } from '@/lib/tournaments'
import type { TournamentPeriod } from '@/lib/tournaments'

export const Route = createFileRoute('/tournaments')({
  loader: () => ({ today: japanDate() }),
  head: () => ({ meta: [
    { title: 'ダーツの大会日程 | darts spec' },
    { name: 'description', content: 'JAPAN・PERFECTの確認済み大会日程を、開催日・ツアー・都道府県から探せます。詳細は主催者の公式情報へ。' },
  ] }),
  component: TournamentsPage,
})

const PREFECTURES = [...new Set(TOURNAMENTS.map((event) => event.prefecture))]
const selectClass = 'mt-2 w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-3 text-primary'

function TournamentsPage() {
  const { today } = Route.useLoaderData()
  const [period, setPeriod] = useState<TournamentPeriod>('upcoming')
  const [tour, setTour] = useState('')
  const [prefecture, setPrefecture] = useState('')
  const events = filterTournaments(TOURNAMENTS, { period, tour, prefecture }, today)

  return (
    <InfoLayout title="ダーツの大会を探す" description="次に観たい試合、足を運びたい会場を。国内ソフトダーツの大会日程を、公式情報への入口とともにまとめました。">
      <p className="mb-6 text-sm leading-relaxed text-secondary">運営が確認した一部の大会を掲載しています。全大会を網羅するものではありません。日程変更・参加資格・観戦条件・配信情報はリンク先の公式案内をご確認ください。</p>
      <div className="mb-6 grid gap-4 rounded-2xl border border-line p-5 sm:grid-cols-3">
        <label className="min-w-0 text-sm text-secondary">開催日
          <select className={selectClass} value={period} onChange={(event) => {
            const value = event.target.value
            if (value === 'upcoming' || value === 'past' || value === 'all') setPeriod(value)
          }}><option value="upcoming">今日以降</option><option value="past">開催日が過ぎた大会</option><option value="all">すべて</option></select>
        </label>
        <label className="min-w-0 text-sm text-secondary">ツアー
          <select className={selectClass} value={tour} onChange={(event) => setTour(event.target.value)}><option value="">すべてのツアー</option><option value="JAPAN">JAPAN</option><option value="PERFECT">PERFECT</option></select>
        </label>
        <label className="min-w-0 text-sm text-secondary">都道府県
          <select className={selectClass} value={prefecture} onChange={(event) => setPrefecture(event.target.value)}><option value="">すべての地域</option>{PREFECTURES.map((area) => <option key={area} value={area}>{area}</option>)}</select>
        </label>
      </div>
      <p role="status" className="mb-4 text-sm text-secondary">{events.length}件の大会／開催日の判定：{today}（日本時間）</p>
      {events.length ? (
        <div className="space-y-4">{events.map((event) => (
          <article key={event.id} className="grid gap-4 rounded-2xl border border-line bg-surface p-6 sm:grid-cols-[9rem_1fr]">
            <div><time dateTime={event.date} className="numeric text-lg font-bold text-accent">{event.date.replaceAll('-', '.')}</time><p className="mt-2 text-xs text-secondary">{event.date < today ? '開催日経過' : event.date === today ? '本日開催予定' : '開催予定'}</p></div>
            <div className="min-w-0"><p className="text-xs text-secondary">{event.tour}／{event.prefecture}</p><h2 className="mt-2 text-lg font-bold">{event.title}</h2><p className="mt-2 text-sm text-secondary">{event.venue}</p><a href={event.source} className="mt-4 inline-block text-sm text-accent underline underline-offset-4">公式の大会情報を見る →</a><p className="mt-3 text-xs text-secondary">出典：{event.tour}公式／確認日：<time dateTime={event.checkedOn}>{event.checkedOn}</time></p></div>
          </article>
        ))}</div>
      ) : (
        <div className="rounded-2xl border border-line p-8 text-center"><h2 className="font-bold">条件に合う掲載大会がありません</h2><p className="mt-3 text-sm text-secondary">条件を変更するか、下の公式日程を確認してください。</p><button type="button" onClick={() => { setPeriod('all'); setTour(''); setPrefecture('') }} className="mt-5 rounded-lg border border-line px-5 py-3 text-accent hover:border-accent">条件をリセットして全件を見る</button></div>
      )}
      <section className="mt-12 border-t border-line pt-6"><h2 className="text-xl font-bold">最新の公式日程を確認する</h2><p className="mt-3 text-sm text-secondary">未掲載の大会や、発表後の変更はこちらから。</p><div className="mt-5 flex flex-wrap gap-6"><a href="https://japanprodarts.jp/" className="text-accent hover:underline">JAPAN 公式 →</a><a href="https://www.prodarts.jp/schedule/" className="text-accent hover:underline">PERFECT 公式日程 →</a></div><Link to="/rules" className="mt-6 inline-block text-sm text-secondary hover:text-accent">観戦前に基本ルールを確認する →</Link></section>
    </InfoLayout>
  )
}
