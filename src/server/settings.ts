import { createServerFn } from '@tanstack/react-start'
import { desc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { parts, settings, user } from '@/db/schema'
import type { Part, PartCategory } from '@/db/schema'
import { canModifySetting, canViewSetting } from '@/lib/authz'
import { calcSpec } from '@/lib/calcSpec'
import { db } from '@/lib/db'
import { requireSession } from '@/server/session'
import { auth } from '@/lib/auth'
import { getRequestHeaders } from '@tanstack/react-start/server'

const settingInput = z.object({
  title: z.string().trim().min(1, 'セッティング名を入力してください').max(100),
  barrelId: z.string().nullish(),
  shaftId: z.string().nullish(),
  flightId: z.string().nullish(),
  tipId: z.string().nullish(),
  visibility: z.enum(['public', 'private']).default('public'),
})

type SettingInput = z.infer<typeof settingInput>

type SelectedParts = Partial<Record<PartCategory, Part>>

/**
 * クライアントから渡されたパーツ ID を DB の実データで解決する。
 * ID の実在・カテゴリの一致を検証し、合算値はサーバ側で再計算する（改ざん防止、docs/04 §5）。
 */
async function resolveParts(input: SettingInput): Promise<SelectedParts> {
  const slots: Array<[PartCategory, string | null | undefined]> = [
    ['barrel', input.barrelId],
    ['shaft', input.shaftId],
    ['flight', input.flightId],
    ['tip', input.tipId],
  ]
  const ids = slots.map(([, id]) => id).filter((id): id is string => Boolean(id))
  if (ids.length === 0) return {}

  const rows = await db.select().from(parts).where(inArray(parts.id, ids))
  const byId = new Map(rows.map((row) => [row.id, row]))

  const selected: SelectedParts = {}
  for (const [category, id] of slots) {
    if (!id) continue
    const part = byId.get(id)
    if (!part || part.isActive === false) {
      throw new Error(`パーツが見つかりません: ${category}`)
    }
    if (part.category !== category) {
      throw new Error(`パーツのカテゴリが一致しません: ${category}`)
    }
    selected[category] = part
  }
  return selected
}

function totalsOf(selected: SelectedParts) {
  return calcSpec({
    barrel: selected.barrel?.spec,
    shaft: selected.shaft?.spec,
    flight: selected.flight?.spec,
    tip: selected.tip?.spec,
  })
}

/** セッティング作成（認証必須・サーバ側で合算再計算、#29） */
export const createSetting = createServerFn({ method: 'POST' })
  .validator(settingInput)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const selected = await resolveParts(data)
    const totals = totalsOf(selected)

    const [created] = await db
      .insert(settings)
      .values({
        userId: session.user.id,
        title: data.title,
        barrelId: selected.barrel?.id ?? null,
        shaftId: selected.shaft?.id ?? null,
        flightId: selected.flight?.id ?? null,
        tipId: selected.tip?.id ?? null,
        totalWeightG: totals.totalWeightG,
        totalLengthMm: totals.totalLengthMm,
        visibility: data.visibility,
      })
      .returning({ id: settings.id })

    return created
  })

/** セッティング編集（所有者のみ・サーバ側で合算再計算、#30） */
export const updateSetting = createServerFn({ method: 'POST' })
  .validator(settingInput.extend({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSession()
    const [existing] = await db.select().from(settings).where(eq(settings.id, data.id))
    if (!existing || !canModifySetting(session.user.id, existing)) {
      throw new Error('FORBIDDEN')
    }

    const selected = await resolveParts(data)
    const totals = totalsOf(selected)

    await db
      .update(settings)
      .set({
        title: data.title,
        barrelId: selected.barrel?.id ?? null,
        shaftId: selected.shaft?.id ?? null,
        flightId: selected.flight?.id ?? null,
        tipId: selected.tip?.id ?? null,
        totalWeightG: totals.totalWeightG,
        totalLengthMm: totals.totalLengthMm,
        visibility: data.visibility,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, data.id))

    return { id: data.id }
  })

/** セッティング削除（所有者のみ、#30） */
export const deleteSetting = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const session = await requireSession()
    const [existing] = await db.select().from(settings).where(eq(settings.id, data.id))
    if (!existing || !canModifySetting(session.user.id, existing)) {
      throw new Error('FORBIDDEN')
    }
    await db.delete(settings).where(eq(settings.id, data.id))
    return { id: data.id }
  })

/** 選択パーツをまとめて解決して返すヘルパー */
async function attachParts(rows: (typeof settings.$inferSelect)[]) {
  const partIds = [
    ...new Set(
      rows.flatMap((row) =>
        [row.barrelId, row.shaftId, row.flightId, row.tipId].filter((id): id is string =>
          Boolean(id),
        ),
      ),
    ),
  ]
  const partRows = partIds.length ? await db.select().from(parts).where(inArray(parts.id, partIds)) : []
  const byId = new Map(partRows.map((row) => [row.id, row]))

  return rows.map((row) => ({
    ...row,
    barrel: row.barrelId ? (byId.get(row.barrelId) ?? null) : null,
    shaft: row.shaftId ? (byId.get(row.shaftId) ?? null) : null,
    flight: row.flightId ? (byId.get(row.flightId) ?? null) : null,
    tip: row.tipId ? (byId.get(row.tipId) ?? null) : null,
  }))
}

/** 自分のセッティング一覧（マイページ用、#30） */
export const getMySettings = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await requireSession()
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.userId, session.user.id))
    .orderBy(desc(settings.updatedAt))
  return attachParts(rows)
})

/**
 * セッティング取得（public は誰でも / private は所有者のみ、#31）。
 * 見つからない・閲覧不可の場合は null を返す（存在の有無を漏らさない）。
 */
export const getSetting = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const [row] = await db.select().from(settings).where(eq(settings.id, data.id))
    if (!row) return null

    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!canViewSetting(session?.user.id, { userId: row.userId, visibility: row.visibility })) {
      return null
    }

    const [withParts] = await attachParts([row])
    const [author] = await db
      .select({ name: user.name, handle: user.handle })
      .from(user)
      .where(eq(user.id, row.userId))

    return { ...withParts!, author: author ?? null }
  })

export type SettingWithParts = NonNullable<Awaited<ReturnType<typeof getSetting>>>
export type MySetting = Awaited<ReturnType<typeof getMySettings>>[number]
