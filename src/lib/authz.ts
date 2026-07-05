/**
 * セッティングの認可ルール（docs/04 §4）。
 * D1 には RLS がないため、server function は必ずこの関数で認可を判定する。
 */

type SettingLike = {
  userId: string
  visibility: 'public' | 'private' | null
}

/** 編集・削除は所有者のみ */
export function canModifySetting(
  sessionUserId: string | null | undefined,
  setting: Pick<SettingLike, 'userId'>,
): boolean {
  return Boolean(sessionUserId) && sessionUserId === setting.userId
}

/** public は誰でも閲覧可。private は所有者のみ */
export function canViewSetting(
  sessionUserId: string | null | undefined,
  setting: SettingLike,
): boolean {
  if (setting.visibility !== 'private') return true
  return canModifySetting(sessionUserId, setting)
}
