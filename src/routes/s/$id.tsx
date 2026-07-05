import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { getSetting } from '@/server/settings'
import { SettingCard } from '@/components/SettingCard'

export const Route = createFileRoute('/s/$id')({
  validateSearch: (search: Record<string, unknown>): { created?: boolean } =>
    search.created === true || search.created === 'true' ? { created: true } : {},
  loader: async ({ params }) => {
    const setting = await getSetting({ data: { id: params.id } })
    if (!setting) throw notFound()
    return setting
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
          isOwner ? (
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
          ) : undefined
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
