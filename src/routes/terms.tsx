import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: '利用規約 | darts spec' }] }),
  component: TermsPage,
})

const SECTIONS: Array<{ heading: string; items: string[] }> = [
  {
    heading: '第 1 条（適用）',
    items: [
      '本規約は、darts spec（以下「本サービス」）の利用に関する条件を定めるものです。利用者は、本サービスを利用することで本規約に同意したものとみなします。',
    ],
  },
  {
    heading: '第 2 条（アカウント）',
    items: [
      '利用者は、正確な情報を用いてアカウントを登録するものとします。',
      'アカウントの管理責任は利用者本人にあります。認証情報の第三者への貸与・共有はできません。',
      '利用者はいつでもアカウントの削除を運営者に申請できます。',
    ],
  },
  {
    heading: '第 3 条（投稿コンテンツ）',
    items: [
      '利用者が作成したセッティング情報（タイトル・パーツ構成等）の権利は利用者に帰属します。',
      '公開設定のセッティングは、URL を知る誰でも閲覧でき、OGP 画像として SNS 上に表示されることがあります。',
      '運営者は、本サービスの提供・宣伝に必要な範囲で、公開されたセッティング情報を表示・複製できるものとします。',
    ],
  },
  {
    heading: '第 4 条（禁止事項）',
    items: [
      '法令または公序良俗に違反する行為',
      '第三者の権利（著作権・商標権・プライバシー等）を侵害する行為',
      '本サービスの運営を妨害する行為（不正アクセス、過度な自動アクセスを含む）',
      '他の利用者になりすます行為',
    ],
  },
  {
    heading: '第 5 条（商標について）',
    items: [
      '本サービスに収録されているパーツの製品名・ブランド名は、各社の商標または登録商標です。本サービスは各ブランドと提携・公認関係にはなく、スペック情報は事実情報として掲載しています。',
    ],
  },
  {
    heading: '第 6 条（免責）',
    items: [
      '掲載されているパーツのスペック値は参考情報であり、正確性・完全性を保証しません。',
      '運営者は、本サービスの利用により生じた損害について、故意または重過失による場合を除き責任を負いません。',
      '本サービスは予告なく内容の変更・停止・終了を行うことがあります。',
    ],
  },
  {
    heading: '第 7 条（規約の変更）',
    items: [
      '運営者は、必要と判断した場合に本規約を変更できます。重要な変更は本サービス上で周知します。',
    ],
  },
]

function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">利用規約</h1>
      <p className="mb-8 text-sm text-secondary">制定日: 2026 年 7 月 5 日</p>
      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 font-bold">{section.heading}</h2>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-secondary">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
        <section>
          <h2 className="mb-2 font-bold">お問い合わせ</h2>
          <p className="text-sm leading-relaxed text-secondary">
            本規約に関するお問い合わせは{' '}
            <a
              href="https://github.com/ryoohshima/DartsSpec/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              GitHub Issues
            </a>{' '}
            までお願いします。
          </p>
        </section>
      </div>
    </div>
  )
}
