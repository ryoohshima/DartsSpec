import { drizzle } from 'drizzle-orm/d1'
import { env } from 'cloudflare:workers'
import * as schema from '@/db/schema'

// D1 バインディングは wrangler.jsonc の `DB`（docs/04 §7）
export const db = drizzle(env.DB, { schema })
