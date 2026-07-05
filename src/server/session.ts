import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth'

/** 現在のセッションを返す（未ログインなら null） */
export const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  return auth.api.getSession({ headers })
})

/**
 * server function 内で認証を要求するヘルパー。
 * 未ログインなら Unauthorized を投げる（呼び出し側はログイン画面へ誘導する）。
 */
export async function requireSession() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}
