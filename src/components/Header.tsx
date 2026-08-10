import { Link, useNavigate } from '@tanstack/react-router'
import { signOut, useSession } from '@/lib/auth-client'

export function Header() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <header className="border-b border-line bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden>🎯</span>
          <span>
            darts <span className="text-accent">spec</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            to="/settings/new"
            className="rounded-lg px-3 py-2 text-secondary transition-colors hover:text-primary"
          >
            つくる
          </Link>
          {isPending ? null : session ? (
            <>
              <Link
                to="/settings"
                className="rounded-lg px-3 py-2 text-secondary transition-colors hover:text-primary"
              >
                マイページ
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-line px-3 py-2 text-secondary transition-colors hover:text-primary"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="rounded-lg px-3 py-2 text-secondary transition-colors hover:text-primary"
              >
                ログイン
              </Link>
              <Link
                to="/sign-up"
                className="rounded-lg bg-accent px-3 py-2 font-semibold text-base transition-opacity hover:opacity-90"
              >
                はじめる
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
