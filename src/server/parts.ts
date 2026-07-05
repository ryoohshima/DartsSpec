import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { PART_CATEGORIES, parts } from '@/db/schema'
import { db } from '@/lib/db'

const getPartsInput = z
  .object({
    category: z.enum(PART_CATEGORIES).optional(),
  })
  .optional()

/** カテゴリ別パーツ取得（セレクトボックス用・認証不要、docs/04 §5） */
export const getParts = createServerFn({ method: 'GET' })
  .validator(getPartsInput)
  .handler(async ({ data }) => {
    const conditions = [eq(parts.isActive, true)]
    if (data?.category) {
      conditions.push(eq(parts.category, data.category))
    }
    return db
      .select({
        id: parts.id,
        category: parts.category,
        brand: parts.brand,
        series: parts.series,
        name: parts.name,
        standard: parts.standard,
        spec: parts.spec,
      })
      .from(parts)
      .where(and(...conditions))
      .orderBy(asc(parts.brand), asc(parts.name))
  })

export type PartOption = Awaited<ReturnType<typeof getParts>>[number]
