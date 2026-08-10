import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { mySettingsQueryOptions } from '@/lib/queries'
import { deleteSetting } from '@/server/settings'
import { getSession } from '@/server/session'
import { SettingCard } from '@/components/SettingCard'
import { ShareButtons } from '@/components/ShareButtons'
import type { MySetting } from '@/server/settings'

export const Route = createFileRoute('/settings/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/sign-in', search: { redirect: '/settings' } })
    }
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(mySettingsQueryOptions),
  component: MyPage,
})

function MyPage() {
  const { data: settings } = useSuspenseQuery(mySettingsQueryOptions)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイページ</h1>
        <Link
          to="/settings/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-base transition-opacity hover:opacity-90"
        >
          ＋ 新しいセッティング
        </Link>
      </div>

      {settings.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-secondary">
          <p className="mb-4">まだセッティングがありません。</p>
          <Link to="/settings/new" className="text-accent hover:underline">
            最初のセッティングをつくる
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {settings.map((setting) => (
            <MySettingCard key={setting.id} setting={setting} />
          ))}
        </div>
      )}
    </div>
  )
}

function MySettingCard({ setting }: { setting: MySetting }) {
  const queryClient = useQueryClient()
  const removeMutation = useMutation({
    mutationFn: () => deleteSetting({ data: { id: setting.id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', 'me'] }),
  })

  const handleDelete = () => {
    if (window.confirm(`「${setting.title}」を削除します。よろしいですか？`)) {
      removeMutation.mutate()
    }
  }

  return (
    <SettingCard
      title={setting.title}
      totalWeightG={setting.totalWeightG}
      totalLengthMm={setting.totalLengthMm}
      parts={{
        barrel: setting.barrel,
        shaft: setting.shaft,
        flight: setting.flight,
        tip: setting.tip,
      }}
      footer={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {setting.visibility === 'private' ? (
            <span className="rounded-full border border-line px-2 py-0.5 text-xs text-secondary">
              非公開
            </span>
          ) : (
            <ShareButtons
              settingId={setting.id}
              title={setting.title}
              totalWeightG={setting.totalWeightG}
              totalLengthMm={setting.totalLengthMm}
            />
          )}
          <Link
            to="/s/$id"
            params={{ id: setting.id }}
            className="rounded-lg border border-line px-3 py-2 text-secondary transition-colors hover:text-primary"
          >
            公開ページ
          </Link>
          <Link
            to="/settings/$id/edit"
            params={{ id: setting.id }}
            className="rounded-lg border border-line px-3 py-2 text-secondary transition-colors hover:text-primary"
          >
            編集
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={removeMutation.isPending}
            className="rounded-lg border border-line px-3 py-2 text-danger transition-opacity hover:opacity-80 disabled:opacity-50"
          >
            削除
          </button>
        </div>
      }
    />
  )
}
