import { createFileRoute } from '@tanstack/react-router'
import { eq, inArray } from 'drizzle-orm'
import { ImageResponse } from 'workers-og'
import { parts, settings, user } from '@/db/schema'
import { db } from '@/lib/db'
import { buildFallbackOgHtml, buildOgHtml, loadOgFonts } from '@/lib/og'

/**
 * 動的 OGP 画像生成（GET /api/og/{id}、#34）。
 *
 * - 存在しない id → 404
 * - 非公開セッティング → 汎用のサービス OGP（存在の有無を漏らさない、docs/03 §6.4）
 * - 生成結果は Cloudflare Cache に 1 日キャッシュ（#38）。
 *   編集時は og:image URL の `?v={updatedAt}` が変わるため実質即時に無効化される。
 */
export const Route = createFileRoute('/api/og/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        // DOM の CacheStorage 型が優先され `default` が見えないため、Workers 実体に合わせてキャスト
        const cache = (caches as unknown as { default: Cache }).default
        const cached = await cache.match(request)
        if (cached) return cached

        const [row] = await db.select().from(settings).where(eq(settings.id, params.id))
        if (!row) {
          return new Response('Not Found', { status: 404 })
        }

        let html: string
        if (row.visibility === 'private') {
          html = buildFallbackOgHtml()
        } else {
          const partIds = [row.barrelId, row.shaftId, row.flightId, row.tipId].filter(
            (id): id is string => Boolean(id),
          )
          const [partRows, [author]] = await Promise.all([
            partIds.length ? db.select().from(parts).where(inArray(parts.id, partIds)) : [],
            db.select({ name: user.name, handle: user.handle }).from(user).where(eq(user.id, row.userId)),
          ])
          const byId = new Map(partRows.map((part) => [part.id, part]))
          const partOf = (id: string | null) => (id ? (byId.get(id) ?? null) : null)

          html = buildOgHtml({
            title: row.title,
            authorName: author ? `@${author.handle ?? author.name}` : null,
            totalWeightG: row.totalWeightG,
            totalLengthMm: row.totalLengthMm,
            parts: {
              barrel: partOf(row.barrelId),
              shaft: partOf(row.shaftId),
              flight: partOf(row.flightId),
              tip: partOf(row.tipId),
            },
          })
        }

        const fonts = await loadOgFonts(html)
        const response = new ImageResponse(html, {
          width: 1200,
          height: 630,
          fonts,
          emoji: 'twemoji',
          headers: {
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        })

        await cache.put(request, response.clone())
        return response
      },
    },
  },
})
