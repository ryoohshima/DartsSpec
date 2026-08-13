import type { QueryClient } from '@tanstack/react-query'
import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import appCss from '../styles.css?url'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'darts spec | ダーツのマイセッティングを美しくシェア' },
      {
        name: 'description',
        content:
          'バレル・シャフト・フライト・チップを選ぶだけで総重量と全長を自動計算。あなたのダーツセッティングを 1 枚のカードにして SNS でシェアできます。',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', type: 'image/png', href: '/icon.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-base font-sans text-primary antialiased">
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation}>
            <div className="flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LazyMotion>
        </MotionConfig>
        <Scripts />
      </body>
    </html>
  )
}
