import { describe, expect, test } from 'vitest'
import { canModifySetting, canViewSetting } from '@/lib/authz'

const setting = { userId: 'owner-1', visibility: 'public' as const }
const privateSetting = { userId: 'owner-1', visibility: 'private' as const }

describe('canModifySetting', () => {
  test('所有者は編集・削除できる', () => {
    expect(canModifySetting('owner-1', setting)).toBe(true)
  })

  test('他人のセッティングは編集・削除できない', () => {
    expect(canModifySetting('other-user', setting)).toBe(false)
  })

  test('未ログインでは編集・削除できない', () => {
    expect(canModifySetting(null, setting)).toBe(false)
    expect(canModifySetting(undefined, setting)).toBe(false)
  })
})

describe('canViewSetting', () => {
  test('public は未ログインでも閲覧できる', () => {
    expect(canViewSetting(null, setting)).toBe(true)
  })

  test('private は所有者のみ閲覧できる', () => {
    expect(canViewSetting('owner-1', privateSetting)).toBe(true)
    expect(canViewSetting('other-user', privateSetting)).toBe(false)
    expect(canViewSetting(null, privateSetting)).toBe(false)
  })

  test('visibility が null（既定値未設定）の場合は public 扱い', () => {
    expect(canViewSetting(null, { userId: 'owner-1', visibility: null })).toBe(true)
  })
})
