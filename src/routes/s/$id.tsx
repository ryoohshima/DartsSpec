import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { getSetting } from '@/server/settings'
import { SettingCard } from '@/components/SettingCard'
import { ShareButtons } from '@/components/ShareButtons'

function formatSpec(value: number | null | undefined): string {
  return typeof value === 'number' ? value.toFixed(1) : '—'
}

export const Route = createFileRoute('/s/$id')({
  validateSearch: (search: Record<string, unknown>): { created?: boolean } =>
    search.created === true || search.created === 'true' ? { created: true } : {},
  loader: async ({ params }) => {
    const setting = await getSetting({ data: { id: params.id } })
    if (!setting) throw notFound()
    return setting
  },
  // SNS クローラー向けの OGP メタタグ（#36）。og:image は動的生成 API を指し、
  // `?v={updatedAt}` で編集時にキャッシュを実質破棄する（#38）
  head: ({ loaderData }) => {
    if (!loaderData) return {}
    const site = import.meta.env.VITE_SITE_URL ?? ''
    const version = loaderData.updatedAt ? new Date(loaderData.updatedAt).getTime() : 0
    const title = `${loaderData.title} | darts spec`
    const description = `総重量 ${formatSpec(loaderData.totalWeightG)}g / 全長 ${formatSpec(loaderData.totalLengthMm)}mm`
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${site}/s/${loaderData.id}` },
        { property: 'og:image', content: `${site}/api/og/${loaderData.id}?v=${version}` },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
    }
  },
  component: PublicSettingPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="mb-4 text-secondary">このセッティングは存在しないか、非公開です。</p>
      <Link to="/" className="text-accent hover:underline">
        トップへ戻る
      </Link>
    </div>
  ),
})

function PublicSettingPage() {
  const setting = Route.useLoaderData()
  const { created } = Route.useSearch()
  const { data: session } = useSession()
  const isOwner = session?.user.id === setting.userId

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {created && (
        <div className="mb-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          セッティングを保存しました 🎯 この URL を共有すると誰でも閲覧できます。
        </div>
      )}

      <SettingCard
        title={setting.title}
        authorName={setting.author ? `@${setting.author.handle ?? setting.author.name}` : null}
        totalWeightG={setting.totalWeightG}
        totalLengthMm={setting.totalLengthMm}
        parts={{
          barrel: setting.barrel,
          shaft: setting.shaft,
          flight: setting.flight,
          tip: setting.tip,
        }}
        footer={
          <div className="flex flex-col gap-4">
            <ShareButtons
              settingId={setting.id}
              title={setting.title}
              totalWeightG={setting.totalWeightG}
              totalLengthMm={setting.totalLengthMm}
              prominent={created}
            />
            {isOwner && (
              <div className="flex gap-2 text-sm">
                <Link
                  to="/settings/$id/edit"
                  params={{ id: setting.id }}
                  className="rounded-lg border border-line px-3 py-2 text-secondary transition-colors hover:text-primary"
                >
                  編集
                </Link>
                <Link
                  to="/settings"
                  className="rounded-lg border border-line px-3 py-2 text-secondary transition-colors hover:text-primary"
                >
                  マイページ
                </Link>
              </div>
            )}
          </div>
        }
      />

      <p className="mt-8 text-center text-sm text-secondary">
        自分のセッティングもつくってみませんか？{' '}
        <Link to="/settings/new" className="text-accent hover:underline">
          無料でつくる
        </Link>
      </p>
    </div>
  )
}
