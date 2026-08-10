import { useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { partsQueryOptions } from '@/lib/queries'
import { getSetting, updateSetting } from '@/server/settings'
import { SettingForm, type SettingFormValues } from '@/components/SettingForm'

export const Route = createFileRoute('/settings/$id/edit')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(partsQueryOptions)
    const setting = await getSetting({ data: { id: params.id } })
    if (!setting) throw notFound()
    return setting
  },
  component: EditSettingPage,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center text-secondary">
      セッティングが見つかりませんでした。
    </div>
  ),
})

function EditSettingPage() {
  const setting = Route.useLoaderData()
  const { data: partsList } = useSuspenseQuery(partsQueryOptions)
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [values, setValues] = useState<SettingFormValues>({
    title: setting.title,
    barrelId: setting.barrelId,
    shaftId: setting.shaftId,
    flightId: setting.flightId,
    tipId: setting.tipId,
    visibility: setting.visibility ?? 'public',
  })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: SettingFormValues) =>
      updateSetting({ data: { ...input, id: setting.id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'me'] })
      navigate({ to: '/s/$id', params: { id: setting.id } })
    },
    onError: () => setError('更新に失敗しました。時間をおいて再度お試しください。'),
  })

  // 所有者チェックは server function 側でも必ず行う（ここは表示制御のみ）
  if (!sessionPending && session && session.user.id !== setting.userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-secondary">
        このセッティングを編集する権限がありません。
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold">セッティングを編集</h1>
      <SettingForm
        partsList={partsList}
        values={values}
        onChange={setValues}
        onSubmit={() => {
          setError(null)
          mutation.mutate(values)
        }}
        submitLabel="更新する"
        submitting={mutation.isPending}
        error={error}
      />
    </div>
  )
}
