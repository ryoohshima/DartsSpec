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
- **`trustPolicy: no-downgrade` 初導入時は既存ロックファイルの旧パッケージで誤検知しうる**: provenance 機能が存在しなかった時代に公開された安定版（今回は babel 経由の `semver@6.3.1`, 2023-07 公開）は、同パッケージの後発バージョンが provenance 対応した瞬間に「trust downgrade」と誤って弾かれる。レジストリの `dist.signatures` / `dist.attestations` / ハッシュを実際に照合し、改変なしと確認できたら `pnpm-workspace.yaml` の `trustPolicyExclude` にピンポイントで追加する（`trustPolicyIgnoreAfter` は期間全体を緩めるため、個別検証済みの1件だけ許可する方が最小差分）。

## UI

- 長い `<option>` を持つ `<select>` は内在幅で親コンテナをはみ出す。`w-full min-w-0` を付けてモバイル幅を守る。

## MCP / ブラウザ自動化（2026-07-22 Gmail 整理タスク）

- **Google ログインを DevTools MCP の別プロファイル Chrome で行わせない**: chrome-devtools-mcp が起動する Chrome は独立プロファイルかつ automation 制御下にあり、Google がサインインを拒否することが多い。ログイン済みセッションが必要な操作は、①本人の Chrome に入る拡張（claude-in-chrome）、② API/コネクタ経由、③手順書を渡して手動、の順で選ぶこと。
- **コネクタの書き込み系操作は着手前にスコープを 1 回検証する**: claude.ai Gmail コネクタは接続時の同意内容次第で読み取り専用になる（`create_label` が insufficient authentication scopes で失敗）。計画段階で軽い書き込みを 1 件試してから工程を組むと手戻りがない。
- **OAuth 再認証の案内は「完全手順」を最初から一度に出す**: 「再接続して」だけ伝えると Google が旧同意を再利用してスコープが変わらず、試行が何往復も無駄になる。①提供元（myaccount.google.com/connections）で権限を完全削除 → ②アプリ側で切断 → ③再接続時にチェックボックス全オン → ④クライアント側で /mcp 再接続、の 4 段を必ずセットで提示すること。
- **バックグラウンド班の failed/interrupted 通知を「死亡」と即断しない**: 失敗通知後もエージェントは transcript から再開され得るし、報告前に作業の大半を終えていることもある。引き継ぐ前に必ず SendMessage で最終状態を照会し、実データ（Gmail 側の付与状況など）で進捗を検証してから再割り当てすること。今回は確認を怠り、稼働中の班と同じ 835 件のラベル付けを main 側で重複実行してユーザーの中断を招いた。
