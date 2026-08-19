# darts spec

ダーツのマイセッティング（バレル / シャフト / フライト / チップ）を作成・保存し、公開 URL と動的 OGP で SNS にシェアできる CGM サービス。

本番環境: <https://darts-spec.com>

## 技術スタック

TanStack Start / React 19 / Tailwind CSS v4 / Drizzle ORM / D1 / better-auth / Cloudflare Workers

詳細と選定理由は [docs/content/04-architecture.md](./docs/content/04-architecture.md) を参照。

## 開発

```sh
pnpm install
pnpm run db:migrate   # D1 マイグレーション（ローカル）
pnpm run db:seed      # パーツマスタ投入
pnpm run dev          # http://localhost:3000
```

| コマンド | 内容 |
|---|---|
| `pnpm run build` | 本番ビルド |
| `pnpm run test` | Vitest |
| `pnpm run typecheck` | 型チェック |
| `pnpm run deploy` | Cloudflare Workers へデプロイ |

## ドキュメント

設計・企画ドキュメントは [`docs/`](./docs/) に集約してある（索引は [docs/README.md](./docs/README.md)）。

- `docs/content/` — ドキュメント本体。編集先は常にこちら
- `docs/site/` — それを Nimbus で配信するドキュメントサイト。複製は持たず `content/` を直接読む

サイトの起動方法は [docs/README.md](./docs/README.md#ドキュメントサイトの起動) を参照。
