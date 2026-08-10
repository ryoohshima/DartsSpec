import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-6 text-xs text-secondary sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} darts spec</p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link to="/terms" className="transition-colors hover:text-primary">
            利用規約
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-primary">
            プライバシーポリシー
          </Link>
          <a
            href="https://github.com/ryoohshima/DartsSpec/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            お問い合わせ・バグ報告
          </a>
        </nav>
      </div>
    </footer>
  )
}
