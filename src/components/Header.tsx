import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { signOut, useSession } from '@/lib/auth-client'

const linkClass = 'rounded-lg px-3 py-2 text-secondary transition-colors hover:text-primary'

export function Header() {
  const { data: session, isPending } = useSession()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const handleSignOut = async () => {
    closeMenu()
    await signOut()
    navigate({ to: '/' })
  }

  // モバイルメニューとデスクトップ nav で共通のリンク群
  const navItems = (
    <>
      <Link to="/settings/new" onClick={closeMenu} className={linkClass}>
        つくる
      </Link>
      {isPending ? null : session ? (
        <>
          <Link to="/settings" onClick={closeMenu} className={linkClass}>
            マイページ
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-line px-3 py-2 text-left text-secondary transition-colors hover:text-primary"
          >
            ログアウト
          </button>
        </>
      ) : (
        <>
          <Link to="/sign-in" onClick={closeMenu} className={linkClass}>
            ログイン
          </Link>
          <Link
            to="/sign-up"
            onClick={closeMenu}
            className="rounded-lg bg-accent px-3 py-2 text-center font-semibold text-base transition-opacity hover:opacity-90"
          >
            登録
          </Link>
        </>
      )}
    </>
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden>🎯</span>
          <span>
            darts <span className="text-accent">spec</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 text-sm sm:flex">{navItems}</nav>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="メニュー"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-secondary transition-colors hover:text-primary sm:hidden"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-line bg-base/95 px-4 py-3 text-sm backdrop-blur sm:hidden">
          {navItems}
        </nav>
      )}
    </header>
  )
}
