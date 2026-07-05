import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-center gap-6 py-24 text-center">
        <p className="text-sm font-semibold tracking-[0.2em] text-accent">MY DARTS SETTING</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
          マイセッティングを、
          <br />
          美しくシェアしよう。
        </h1>
        <p className="max-w-xl text-secondary">
          バレル・シャフト・フライト・チップを選ぶだけで、総重量と全長を自動計算。
          あなたのセッティングを 1 枚のカードにして、X でシェアできます。
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            to="/sign-up"
            className="rounded-xl bg-accent px-8 py-4 text-lg font-bold text-base transition-opacity hover:opacity-90"
          >
            セッティングをつくる
          </Link>
          <Link
            to="/sign-in"
            className="rounded-xl border border-line px-8 py-4 text-lg text-secondary transition-colors hover:text-primary"
          >
            ログイン
          </Link>
        </div>
      </section>

      <section className="grid gap-4 pb-24 sm:grid-cols-3">
        {[
          {
            title: '選ぶだけで自動計算',
            body: 'パーツを選ぶと総重量・全長がリアルタイムに変わる。数字が動く気持ちよさを体験してほしい。',
          },
          {
            title: '1 枚のカードに',
            body: 'セッティングは美しいカードとして公開 URL に。ログインしていない相手にもそのまま見せられる。',
          },
          {
            title: 'SNS 映えする OGP',
            body: 'X に URL を貼るだけで、セッティング内容がカード画像として展開される。',
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-2 font-bold">{f.title}</h2>
            <p className="text-sm leading-relaxed text-secondary">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
