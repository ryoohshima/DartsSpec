import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { partsQueryOptions } from '@/lib/queries'
import { createSetting } from '@/server/settings'
import { EMPTY_SETTING, SettingForm, type SettingFormValues } from '@/components/SettingForm'

const DRAFT_KEY = 'dartsspec:draft'

export const Route = createFileRoute('/settings/new')({
  // TanStack Router は ?resume=1 を数値 1 にパースするため、数値・文字列の両方を受ける
  validateSearch: (search: Record<string, unknown>): { resume?: '1' } =>
    search.resume === '1' || search.resume === 1 || search.resume === true ? { resume: '1' } : {},
  loader: ({ context }) => context.queryClient.ensureQueryData(partsQueryOptions),
  component: NewSettingPage,
})

function loadDraft(): SettingFormValues | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    return { ...EMPTY_SETTING, ...(JSON.parse(raw) as Partial<SettingFormValues>) }
  } catch {
    return null
  }
}

function NewSettingPage() {
  const { data: partsList } = useSuspenseQuery(partsQueryOptions)
  const { data: session, isPending: sessionPending } = useSession()
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { resume } = Route.useSearch()

  const [values, setValues] = useState<SettingFormValues>(EMPTY_SETTING)
  const [error, setError] = useState<string | null>(null)
  const resumed = useRef(false)

  // 非ログインで保存しようとした際の下書きを復元する（docs/01 §4.3）
  useEffect(() => {
    const draft = loadDraft()
    if (draft) setValues(draft)
  }, [])

  const mutation = useMutation({
    mutationFn: (input: SettingFormValues) => createSetting({ data: input }),
    onSuccess: ({ id }) => {
      window.localStorage.removeItem(DRAFT_KEY)
      queryClient.invalidateQueries({ queryKey: ['settings', 'me'] })
      navigate({ to: '/s/$id', params: { id }, search: { created: true } })
    },
    onError: () => {
      setError('保存に失敗しました。時間をおいて再度お試しください。')
    },
  })

  // ログインから戻ってきた場合は下書きを自動保存する（docs/01 §4.3）
  useEffect(() => {
    if (resume !== '1' || resumed.current || sessionPending || !session) return
    const draft = loadDraft()
    if (draft && draft.title.trim() !== '') {
      resumed.current = true
      mutation.mutate(draft)
    }
  }, [resume, session, sessionPending, mutation])

  const handleSubmit = () => {
    setError(null)
    if (sessionPending) return
    if (!session) {
      // 未ログイン: 下書きを保持してログインへ誘導し、復帰後に自動保存する
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
      router.navigate({
        to: '/sign-in',
        search: { redirect: '/settings/new?resume=1' },
      })
      return
    }
    mutation.mutate(values)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">セッティングをつくる</h1>
      <p className="mb-8 text-sm text-secondary">
        パーツを選ぶと総重量・全長がリアルタイムに更新されます。
      </p>
      <SettingForm
        partsList={partsList}
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        submitLabel="保存して公開ページをつくる"
        submitting={mutation.isPending}
        error={error}
        guestNote={
          !sessionPending && !session
            ? 'ログインせずに試せます。保存時にログイン（または登録）すると、入力内容はそのまま引き継がれます。'
            : null
        }
      />
    </div>
  )
}
