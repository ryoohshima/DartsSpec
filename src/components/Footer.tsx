export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-6 text-xs text-secondary sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} darts spec</p>
      </div>
    </footer>
  )
}
