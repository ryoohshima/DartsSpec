# 教訓（lessons）

darts spec 実装（2026-07-05、PR #57〜#60）で得た教訓。同じミスを繰り返さないための備忘でござる。

## セキュリティ

- **Open Redirect**: リダイレクト先の検証に `startsWith('/')` だけでは不十分。`//evil.com` や `/\evil.com` はプロトコル相対 URL として外部へ飛ぶ。`/^\/(?![/\\])/` のように 2 文字目を検査すること（sign-in.tsx で自動セキュリティレビューに指摘された）。

## TanStack Start / Router

- **search param は JSON 風にパースされる**: `?resume=1` はコンポーネントに数値 `1` として届く。validateSearch では文字列・数値・真偽の複数形を受けて正規化すること。
- **validateSearch の戻り値はオプショナルキーにする**: `{ key: T | undefined }`（必須キー）で返すと、全 `<Link>` に `search` プロップが強制される。`{ key?: T }` を返す。
- **サーバ専用ヘルパーは `createServerOnlyFn` で包む**: `getRequestHeaders` 等を使う素の関数を server function 以外から export すると、クライアントバンドルの import 保護でビルドが落ちる。
- **型定義とランタイムの乖離**: `.inputValidator()` は d.ts に存在するがランタイムは deprecation 警告で `.validator()` を推奨。警告に従う。

## better-auth

- v1.6 の TanStack Start 連携プラグインは `tanstackStartCookies`（旧 `reactStartCookies` から改名）。
- API を curl で叩くときは CSRF 保護のため `Origin` ヘッダが必須。

## Cloudflare Workers

- **日本語 OGP のフォント**: Noto Sans JP の全字形 base64 埋め込みは無料枠（3MB gzip）に収まらない。Google Fonts の `text=` サブセット API で描画文字だけ取得し、生成結果を Cloudflare Cache に載せる構成が現実的（gzip 合計 1.3MB に収まった）。
- Satori の絵文字は `emoji: 'twemoji'` オプションで解決（デフォルトは豆腐になる）。
- `caches.default` は DOM の CacheStorage 型と衝突する。Workers 実体に合わせてキャストが必要。

## pnpm / ツール

- pnpm 11 のビルドスクリプト許可は `pnpm-workspace.yaml` の `allowBuilds:`。package.json の `pnpm.onlyBuiltDependencies` は効かない。

## UI

- 長い `<option>` を持つ `<select>` は内在幅で親コンテナをはみ出す。`w-full min-w-0` を付けてモバイル幅を守る。
