import { Link, createFileRoute } from '@tanstack/react-router'
import { InfoLayout } from '@/components/InfoLayout'
import { PLACE_CHECKLIST, PLACE_SEARCHES, PLACES_CHECKED_ON } from '@/content/places'

export const Route = createFileRoute('/places')({
  head: () => ({ meta: [
    { title: 'ダーツができる場所を探す | darts spec' },
    { name: 'description', content: 'DARTSLIVE・PHOENIXDARTSの公式店舗検索と、料金・機種・営業時間などお店選びの確認事項を紹介します。' },
  ] }),
  component: PlacesPage,
})

function PlacesPage() {
  return (
    <InfoLayout title="投げる場所を探す" description="近くのお店も、旅先の一軒も。遊びたい機種の公式店舗検索から、投げに行く場所を見つけましょう。">
      <section aria-labelledby="search-heading">
        <h2 id="search-heading" className="mb-5 text-xl font-bold">機種から探す</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {PLACE_SEARCHES.map((search) => (
            <article key={search.name} className="flex flex-col rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <p className="text-sm font-semibold text-accent">{search.machine}</p>
              <h3 className="mt-3 text-xl font-bold">{search.name}</h3>
              <p className="mt-4 mb-6 flex-1 text-sm leading-relaxed text-secondary">{search.description}</p>
              <a href={search.url} className="self-start rounded-lg bg-accent px-5 py-3 font-bold text-base hover:opacity-90">{search.machine}の公式検索へ →</a>
            </article>
          ))}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-secondary">リンク先は外部の公式サイトです。店舗情報・検索条件は各サイトでご確認ください。営業時間や料金は来店前に店舗へ確認しましょう。</p>
        <p className="mt-3 text-xs text-secondary">案内確認日：<time dateTime={PLACES_CHECKED_ON}>{PLACES_CHECKED_ON}</time>／出典：各公式店舗検索</p>
      </section>
      <section className="mt-12" aria-labelledby="check-heading">
        <h2 id="check-heading" className="text-xl font-bold">お店選びで確認したいこと</h2>
        <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">{PLACE_CHECKLIST.map((item) => <div key={item.title}><dt className="font-bold">{item.title}</dt><dd className="mt-2 text-sm leading-relaxed text-secondary">{item.body}</dd></div>)}</dl>
      </section>
      <aside className="mt-12 border-t border-line pt-6"><h2 className="font-bold">初めてお店に行く前に。</h2><p className="mt-3 text-sm text-secondary">基本ルールと安全のポイントを確認しておくと、安心して遊べます。</p><Link to="/rules" className="mt-4 inline-block text-accent hover:underline">ルールとマナーを読む →</Link></aside>
    </InfoLayout>
  )
}
