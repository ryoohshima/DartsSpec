import { useState } from 'react'
import { Link, createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { signIn } from '@/lib/auth-client'
import { GoogleSignInButton } from '@/routes/sign-up'

/**
 * ログイン後の戻り先（サイト内パスのみ許可）。
 * `//evil.com` や `/\evil.com` はプロトコル相対 URL として外部へ飛ぶため拒否する（Open Redirect 対策）。
 */
export function validateRedirectSearch(search: Record<string, unknown>): { redirect?: string } {
  return typeof search.redirect === 'string' && /^\/(?![/\\])/.test(search.redirect)
    ? { redirect: search.redirect }
    : {}
}

export const Route = createFileRoute('/sign-in')({
  validateSearch: validateRedirectSearch,
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn.email({ email, password })
    setSubmitting(false)
    if (error) {
      setError('メールアドレスまたはパスワードが正しくありません。')
      return
    }
    if (redirect) {
      router.history.push(redirect)
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">ログイン</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary">メールアドレス</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary">パスワード</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
          />
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-xl bg-accent px-4 py-3 font-bold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'ログイン中…' : 'ログイン'}
        </button>
      </form>
      <GoogleSignInButton />
      <p className="mt-6 text-sm text-secondary">
        アカウントをお持ちでない方は{' '}
        <Link to="/sign-up" search={{ redirect }} className="text-accent hover:underline">
          アカウント登録
        </Link>
      </p>
    </div>
  )
}
