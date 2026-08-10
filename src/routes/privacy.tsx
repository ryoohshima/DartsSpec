import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'プライバシーポリシー | darts spec' }] }),
  component: PrivacyPage,
})

const SECTIONS: Array<{ heading: string; items: string[] }> = [
  {
    heading: '1. 取得する情報',
    items: [
      'アカウント登録時: メールアドレス、表示名、パスワード（ハッシュ化して保存します）',
      'Google アカウントでのログイン時: Google から提供される氏名・メールアドレス・プロフィール画像',
      'サービス利用時: 作成したセッティング情報、セッションを維持するための Cookie、アクセスログ（IP アドレス・User-Agent）',
    ],
  },
  {
    heading: '2. 利用目的',
    items: [
      '本サービスの提供・本人認証・セッション管理のため',
      '不正利用の防止・障害調査のため',
      'サービス改善のための統計分析（個人を特定しない形式）のため',
    ],
  },
  {
    heading: '3. Cookie について',
    items: [
      '本サービスはログイン状態の維持のために Cookie（セッション Cookie）を使用します。',
      '広告目的のトラッキング Cookie は使用していません。',
    ],
  },
  {
    heading: '4. 外部サービスへの送信',
    items: [
      'Google OAuth: Google アカウントでのログイン時に認証情報が Google に送信されます。',
      'Google Fonts: フォント配信・OGP 画像生成のためにフォントを Google のサーバーから取得します。',
      'Cloudflare: 本サービスは Cloudflare 上で稼働しており、通信は Cloudflare を経由します。',
    ],
  },
  {
    heading: '5. 第三者提供',
    items: [
      '法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。',
    ],
  },
  {
    heading: '6. 削除の請求',
    items: [
      'アカウントおよび登録情報の削除を希望する場合は、下記の問い合わせ先までご連絡ください。合理的な期間内に対応します。',
    ],
  },
  {
    heading: '7. 改定',
    items: [
      '本ポリシーは必要に応じて改定されることがあります。重要な変更は本サービス上で周知します。',
    ],
  },
]

function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">プライバシーポリシー</h1>
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
            個人情報の取り扱いに関するお問い合わせは{' '}
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
