import { Link, createFileRoute } from '@tanstack/react-router'
import { m } from 'framer-motion'
import { SettingCard } from '@/components/SettingCard'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const FEATURES = [
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
]

/** シェアカードの見本（design.pen: 01 Landing / Card Showcase。シードデータの実在パーツを使用） */
const SHOWCASE_PARTS = {
  barrel: { brand: 'COSMO DARTS', series: '96', name: '96 黒瀧摩紀' },
  shaft: { brand: 'COSMO DARTS', series: 'Fit Shaft Carbon', name: 'Fit Shaft Carbon Slim Spin 4' },
  flight: { brand: 'CONDOR', series: 'AXE', name: 'CONDOR AXE Small S' },
  tip: { brand: 'CONDOR', series: 'TIP', name: 'CONDOR TIP' },
}

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
            to="/settings/new"
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
        <p className="text-xs text-secondary">登録なしでもお試しいただけます（保存時にログイン）</p>
      </section>

      <m.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 pb-16"
      >
        <p className="text-[13px] font-semibold tracking-[0.17em] text-accent">SHARE CARD</p>
        <div className="grid w-full gap-6 sm:grid-cols-2">
          <SettingCard
            title="週末リーグ用セッティング"
            totalWeightG={21.1}
            totalLengthMm={99.5}
            isApproximate
            parts={SHOWCASE_PARTS}
          />
          <SettingCard
            title="サブセッティング（ハウス用）"
            totalWeightG={19.8}
            totalLengthMm={96.0}
            parts={SHOWCASE_PARTS}
          />
        </div>
      </m.section>

      <m.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-4 pb-24 sm:grid-cols-3"
      >
        {FEATURES.map((f, i) => (
          <m.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="rounded-2xl border border-line bg-surface p-6"
          >
            <h2 className="mb-2 font-bold">{f.title}</h2>
            <p className="text-sm leading-relaxed text-secondary">{f.body}</p>
          </m.div>
        ))}
      </m.section>
    </div>
  )
}
