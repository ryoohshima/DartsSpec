import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { MorphIcon } from 'morphicons/react'
import { Menu, X } from 'lucide'
import { signOut, useSession } from '@/lib/auth-client'
import { MARK_PATH } from '@/components/BackgroundDartsMark'

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
      <Link to="/rules" onClick={closeMenu} className={linkClass} activeProps={{ 'aria-current': 'page', style: { color: 'var(--color-accent)' } }}>ルール</Link>
      <Link to="/tournaments" onClick={closeMenu} className={linkClass} activeProps={{ 'aria-current': 'page', style: { color: 'var(--color-accent)' } }}>大会</Link>
      <Link to="/places" onClick={closeMenu} className={linkClass} activeProps={{ 'aria-current': 'page', style: { color: 'var(--color-accent)' } }}>場所</Link>
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
            className="rounded-lg bg-accent px-3 py-2 font-semibold text-base transition-opacity hover:opacity-90 lg:text-center"
          >
            登録
          </Link>
        </>
      )}
    </>
  )

  return (
    // メニューは header の外に置く: backdrop-blur が fixed 子孫の包含ブロックを
    // header 自身に変えるため、内側に置くと全画面配置（top-14 bottom-0）が潰れる
    <>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="メインメニュー" className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col gap-1 overflow-y-auto border-t border-line bg-base/80 px-4 py-6 text-base backdrop-blur lg:hidden">
          {navItems}
        </nav>
      )}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-base/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {/* design.pen の Logo Icon（ダーツマーク）。縦長パスを正方 viewBox の中央に配置 */}
          <svg aria-hidden viewBox="0 0 1023.971 1023.971" className="h-5 w-5 fill-accent">
            <path d={MARK_PATH} transform="translate(361.357 0)" />
          </svg>
          <span>
            darts <span className="text-accent">spec</span>
          </span>
        </Link>
        <nav aria-label="メインメニュー" className="hidden items-center gap-2 text-sm lg:flex">{navItems}</nav>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="メニュー"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'mobile-navigation' : undefined}
          className="rounded-lg p-2 text-secondary transition-colors hover:text-primary lg:hidden"
        >
          <MorphIcon icon={menuOpen ? X : Menu} size={24} strokeWidth={2} reducedMotion="user" />
        </button>
      </div>
      </header>
    </>
  )
}
