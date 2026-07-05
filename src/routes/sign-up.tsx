import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { signUp } from '@/lib/auth-client'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signUp.email({ name, email, password })
    setSubmitting(false)
    if (error) {
      setError(error.message ?? '登録に失敗しました。時間をおいて再度お試しください。')
      return
    }
    navigate({ to: '/' })
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-8 text-2xl font-bold">アカウント登録</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-secondary">表示名</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
            placeholder="ダーツ太郎"
          />
        </label>
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
          <span className="text-secondary">パスワード（8 文字以上）</span>
          <input
            type="password"
            required
            minLength={8}
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
          {submitting ? '登録中…' : '登録する'}
        </button>
      </form>
      <GoogleSignInButton />
      <p className="mt-6 text-sm text-secondary">
        アカウントをお持ちの方は{' '}
        <Link to="/sign-in" className="text-accent hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  )
}

export function GoogleSignInButton() {
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    setError(null)
    const { signIn } = await import('@/lib/auth-client')
    const { error } = await signIn.social({ provider: 'google', callbackURL: '/' })
    if (error) {
      setError('Google ログインは現在利用できません。')
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-xl border border-line px-4 py-3 text-sm text-secondary transition-colors hover:text-primary"
      >
        Google で続ける
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  )
}
