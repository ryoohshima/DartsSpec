import { useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'

/** ログイン後にセッティング作成へ戻り、下書きを自動保存させるための戻り先 */
const RESUME_REDIRECT = '/settings/new?resume=1'

type SaveGateModalProps = {
  onClose: () => void
}

/** 未ログイン保存時の登録導線モーダル（design.pen: Modal - Save Gate） */
export function SaveGateModal({ onClose }: SaveGateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // native <dialog> の showModal でフォーカストラップと Escape を任せる
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      closedby="any"
      aria-labelledby="save-gate-title"
      className="m-auto w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-primary shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="閉じる"
          className="self-end text-secondary transition-colors hover:text-primary"
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
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-base)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 id="save-gate-title" className="text-center text-xl font-bold">
          保存には登録が必要です
        </h2>
        <p className="text-center text-sm leading-relaxed text-secondary">
          セッティングの作成・編集は登録なしでお試しいただけます。公開ページとして保存するには、無料のアカウント登録が必要です。
        </p>
        <div className="flex w-full flex-col gap-2.5">
          <Link
            to="/sign-up"
            search={{ redirect: RESUME_REDIRECT }}
            className="rounded-xl bg-accent px-4 py-3 text-center font-bold text-base transition-opacity hover:opacity-90"
          >
            無料で登録して保存
          </Link>
          <Link
            to="/sign-in"
            search={{ redirect: RESUME_REDIRECT }}
            className="rounded-xl border border-line px-4 py-3 text-center text-secondary transition-colors hover:text-primary"
          >
            ログインする
          </Link>
        </div>
      </div>
    </dialog>
  )
}
