/**
 * ログイン後の戻り先（サイト内パスのみ許可）。
 * `//evil.com` や `/\evil.com` はプロトコル相対 URL として外部へ飛ぶため拒否する（Open Redirect 対策）。
 */
export function validateRedirectSearch(search: Record<string, unknown>): { redirect?: string } {
  return typeof search.redirect === 'string' && /^\/(?![/\\])/.test(search.redirect)
    ? { redirect: search.redirect }
    : {}
}
