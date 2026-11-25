import { Link, createFileRoute } from '@tanstack/react-router'
import { InfoLayout } from '@/components/InfoLayout'
import { GLOSSARY, RULE_SECTIONS, RULES_CHECKED_ON } from '@/content/rules'

export const Route = createFileRoute('/rules')({
  head: () => ({ meta: [
    { title: 'ダーツのルール・マナー・用語 | darts spec' },
    { name: 'description', content: 'カウントアップ、01、クリケットの基本ルールと、安全に楽しむためのマナー・ダーツ用語を紹介します。' },
  ] }),
  component: RulesPage,
})

function RulesPage() {
  return (
    <InfoLayout title="ダーツのルールを知る" description="最初の一ゲームから、対戦の楽しさまで。ソフトダーツの基本ルールと、覚えておきたい言葉をまとめました。">
      <nav aria-label="このページの目次" className="mb-10 flex flex-wrap gap-2">
        {RULE_SECTIONS.map((section) => <a key={section.id} href={`#${section.id}`} className="rounded-lg border border-line px-4 py-2 text-sm text-secondary hover:border-accent hover:text-primary">{section.title}</a>)}
        <a href="#glossary" className="rounded-lg border border-line px-4 py-2 text-sm text-secondary hover:border-accent hover:text-primary">用語集</a>
      </nav>
      <p className="mb-8 text-sm leading-relaxed text-secondary">ゲームの細かな設定や勝敗判定は機種・大会によって異なります。プレイ前にマシン設定や大会要項を確認してください。</p>
      <div className="grid gap-6 md:grid-cols-2">
        {RULE_SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-xl font-bold">{section.title}</h2>
            <p className="mt-2 text-accent">{section.summary}</p>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-secondary">
              {section.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <p className="mt-6 text-xs text-secondary">出典・参考：<a href={section.source} className="text-accent underline underline-offset-4">{section.sourceLabel}</a></p>
          </section>
        ))}
        <section id="glossary" className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-bold">ダーツ用語集</h2>
          <dl className="mt-5 space-y-4">
            {GLOSSARY.map(([term, meaning]) => <div key={term}><dt className="font-semibold">{term}</dt><dd className="mt-1 text-sm leading-relaxed text-secondary">{meaning}</dd></div>)}
          </dl>
          <p className="mt-6 text-xs text-secondary">参考：<a href="https://www.dartslive.com/jp/beginner/" className="text-accent underline underline-offset-4">DARTSLIVE はじめてのダーツ</a></p>
        </section>
      </div>
      <p className="mt-6 text-xs text-secondary">内容確認日：<time dateTime={RULES_CHECKED_ON}>{RULES_CHECKED_ON}</time>／運営編集</p>
      <aside className="mt-12 border-t border-line pt-6"><h2 className="font-bold">次は、実際に投げてみよう。</h2><div className="mt-4 flex flex-wrap gap-6"><Link to="/places" className="text-accent hover:underline">投げられる場所を探す →</Link><Link to="/settings/new" className="text-accent hover:underline">自分のセッティングをつくる →</Link></div></aside>
    </InfoLayout>
  )
}
