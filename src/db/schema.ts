import { sqliteTable, text, real, integer, index } from 'drizzle-orm/sqlite-core'

/**
 * パーツ種別ごとの固有スペック（docs/02 §3）。
 * DB 上は TEXT(JSON) で保持し、カテゴリにより使うキーが異なる。
 */
export type PartSpec = {
  /** 重量（g）。バレルは必須、その他は未登録があり得る */
  weight_g?: number
  /** 全長（mm）。バレル・シャフトは必須相当、チップは任意 */
  length_mm?: number
  /** 最大径（mm）。バレルのみ */
  max_diameter_mm?: number
  /** 素材。バレル・シャフト */
  material?: string
  /** フライト形状（スタンダード / シェイプ 等）。フライトのみ */
  shape?: string
  /** フライト厚（例: 100μ）。フライトのみ */
  thickness?: string
  /** ソフト / ハード。チップのみ */
  type?: string
}

export const PART_CATEGORIES = ['barrel', 'shaft', 'flight', 'tip'] as const
export type PartCategory = (typeof PART_CATEGORIES)[number]

// ---------------------------------------------------------------------------
// better-auth 管理テーブル（user / session / account / verification）
// スキーマは better-auth v1.6 の標準に合わせる。user には docs/04 §3.2 の
// アプリ拡張列 `handle` を追加している。
// ---------------------------------------------------------------------------

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .$defaultFn(() => false)
    .notNull(),
  image: text('image'),
  handle: text('handle').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// ---------------------------------------------------------------------------
// アプリ固有テーブル（docs/04 §3.2）
// ---------------------------------------------------------------------------

export const parts = sqliteTable(
  'parts',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    category: text('category', { enum: PART_CATEGORIES }).notNull(),
    brand: text('brand').notNull(),
    series: text('series'),
    name: text('name').notNull(),
    standard: text('standard'),
    spec: text('spec', { mode: 'json' }).$type<PartSpec>().notNull(),
    imageUrl: text('image_url'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  },
  (table) => [
    index('parts_category_brand_idx').on(table.category, table.brand),
    index('parts_name_idx').on(table.name),
  ],
)

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull(),
  barrelId: text('barrel_id').references(() => parts.id),
  shaftId: text('shaft_id').references(() => parts.id),
  flightId: text('flight_id').references(() => parts.id),
  tipId: text('tip_id').references(() => parts.id),
  totalWeightG: real('total_weight_g'),
  totalLengthMm: real('total_length_mm'),
  visibility: text('visibility', { enum: ['public', 'private'] }).default('public'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export type Part = typeof parts.$inferSelect
export type Setting = typeof settings.$inferSelect
