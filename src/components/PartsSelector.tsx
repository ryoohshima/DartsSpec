import { useEffect, useMemo, useRef, useState } from 'react'
import { partDisplayName } from '@/lib/partName'
import { filterParts } from '@/lib/partsSearch'
import type { PartOption } from '@/server/parts'

type PartsSelectorProps = {
  label: string
  options: PartOption[]
  value: string | null
  onChange: (id: string | null) => void
}

function optionLabel(part: PartOption): string {
  const specs: string[] = []
  if (typeof part.spec.weight_g === 'number') specs.push(`${part.spec.weight_g}g`)
  if (typeof part.spec.length_mm === 'number') specs.push(`${part.spec.length_mm}mm`)
  if (part.spec.shape) specs.push(part.spec.shape)
  if (part.standard) specs.push(part.standard)
  const name = partDisplayName(part)
  return specs.length ? `${name}（${specs.join(' / ')}）` : name
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/** キーワード検索モーダルでパーツを選択するフィールド（design.pen: Select Field / Modal - Parts Search） */
export function PartsSelector({ label, options, value, onChange }: PartsSelectorProps) {
  const [open, setOpen] = useState(false)

  const selected = value ? (options.find((p) => p.id === value) ?? null) : null

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-3 text-left outline-none focus:border-accent"
      >
        <span className={`truncate ${selected ? '' : 'text-secondary'}`}>
          {selected ? optionLabel(selected) : '未選択'}
        </span>
        <span className="shrink-0 text-secondary">
          <SearchIcon />
        </span>
      </button>
      {open && (
        <PartsSearchModal
          label={label}
          options={options}
          value={value}
          onSelect={(id) => {
            onChange(id)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

type PartsSearchModalProps = {
  label: string
  options: PartOption[]
  value: string | null
  onSelect: (id: string | null) => void
  onClose: () => void
}

function PartsSearchModal({ label, options, value, onSelect, onClose }: PartsSearchModalProps) {
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // native <dialog> の showModal でフォーカストラップと Escape を任せ、初期フォーカスは検索欄へ
  useEffect(() => {
    dialogRef.current?.showModal()
    inputRef.current?.focus()
  }, [])

  const filtered = useMemo(() => filterParts(options, query), [options, query])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      closedby="any"
      aria-label={`${label}を検索`}
      className="m-auto w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-primary shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{label}を検索</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="閉じる"
            className="text-secondary transition-colors hover:text-primary"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <label className="flex items-center gap-2 rounded-xl border border-line bg-base px-3.5 py-2.5 focus-within:border-accent">
          <span className="sr-only">{label}をキーワードで検索</span>
          <span className="text-secondary">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ブランド名・製品名で検索"
            className="w-full min-w-0 bg-transparent text-[15px] outline-none placeholder:text-secondary"
          />
        </label>
        <ul className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          <li>
            <SearchResultRow
              brand=""
              name="未選択にする"
              selected={value === null}
              onClick={() => onSelect(null)}
            />
          </li>
          {filtered.map((part) => (
            <li key={part.id}>
              <SearchResultRow
                brand={part.brand}
                name={optionLabel(part)}
                selected={part.id === value}
                onClick={() => onSelect(part.id)}
              />
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-secondary">
              「{query}」に一致するパーツが見つかりませんでした
            </li>
          )}
        </ul>
      </div>
    </dialog>
  )
}

function SearchResultRow({
  brand,
  name,
  selected,
  onClick,
}: {
  brand: string
  name: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        selected ? 'bg-accent/15' : 'hover:bg-elevated'
      }`}
    >
      <span className="w-24 shrink-0 truncate text-xs text-secondary">{brand}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      {selected && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-accent"
          aria-hidden
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      )}
    </button>
  )
}
