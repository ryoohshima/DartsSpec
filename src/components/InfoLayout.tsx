import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

export function InfoLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <Link to="/" className="text-sm text-secondary hover:text-accent">トップへ戻る</Link>
      <header className="mt-6 mb-10 max-w-2xl">
        <h1 className="text-balance text-3xl font-bold leading-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 leading-relaxed text-secondary">{description}</p>
      </header>
      {children}
    </div>
  )
}
