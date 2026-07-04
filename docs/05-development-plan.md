# 05. 開発計画 / デプロイ

対応ステップ: **Step 4 — 開発とプロトタイピング（実装・デプロイ）**

[04. アーキテクチャ](./04-architecture.md) の設計をもとに、実際に動くシステムを構築してインターネット上に公開する。

## 1. 実装フェーズ（マイルストーン連動）

[00. ロードマップ](./00-roadmap.md) の M3〜M5 を具体化する。

### Phase A: 基盤構築（M3）

- [ ] TanStack Start + TypeScript + Tailwind の初期セットアップ（pnpm）
- [ ] Cloudflare 連携（`wrangler.jsonc`・`@cloudflare/vite-plugin` / Nitro `cloudflare-module` プリセット・D1 バインディング）
- [ ] TanStack Query の導入と `QueryClientProvider` 配置（`src/router.tsx`、[04 §5.1](./04-architecture.md)）
- [ ] Drizzle スキーマ定義（`parts` / `settings`）と drizzle-kit マイグレーションを D1 に適用
- [ ] better-auth（D1 アダプタ）で登録 / ログイン / ログアウト
- [ ] パーツマスタの seed 投入（[02](./02-parts-data.md) の CSV → `src/db/seed.ts`）
- **完了条件**: ユーザー登録・ログインが動作し、D1 にパーツマスタが入っている。

### Phase B: コア機能（M4）

- [ ] `getParts` server function — カテゴリ別パーツ取得
- [ ] セッティング作成画面 — バレル/シャフト/フライト/チップのセレクトボックス
- [ ] リアルタイム合算表示（`src/lib/calcSpec.ts` を共有・Framer Motion でカウントアップ）
- [ ] `createSetting` server function — サーバ側で合算再計算して保存
- [ ] マイページ（一覧）・編集・削除（`getMySettings` / `updateSetting` / `deleteSetting`）
- [ ] 公開ページ `s/$id`（loader で SSR・非認証で閲覧可能・セッティングカード表示）
- **完了条件**: 「選択 → 合算 → 保存 → 公開 URL 閲覧」が一気通貫で通る。

### Phase C: 動的 OGP & シェア（M5）

- [ ] `GET /api/og/{id}` server route — **workers-og**（Satori + resvg-wasm）で PNG 動的生成（[03 §6](./03-design-system.md)）
- [ ] WASM の static import 設定・埋め込み画像の base64 化・PNG/JPEG 限定（Workers の落とし穴対応）
- [ ] 公開ページに OGP メタタグ付与（`summary_large_image`）
- [ ] シェアボタン（X Web Intent・URL コピー）を作成完了 / マイページに大きく配置
- [ ] OGP のキャッシュ制御・日本語フォントのサブセット化
- **完了条件**: SNS に公開 URL を貼ると、セッティング内容がカード画像で表示される。

## 2. 環境構成

| 環境 | 用途 | ブランチ | ホスティング |
|---|---|---|---|
| local | 開発 | feature ブランチ | `pnpm dev`（Vite + ローカル D1 ミラー） |
| preview | PR レビュー / 動作確認 | PR ごと | Cloudflare Workers Preview（`wrangler versions upload` 等） |
| production | 本番 | `main` | Cloudflare Workers（`wrangler deploy`） |

- Cloudflare の **Preview デプロイ / プレビュー URL** で、OGP や UI をレビュー段階で実機確認できる。ローカルでも `@cloudflare/vite-plugin` が本番バインディング（D1）をミラーする。

## 3. 開発コマンド（想定）

実装確定後、[CLAUDE.md](../CLAUDE.md) と [package.json](../package.json) に反映する。

```sh
pnpm install                # 依存インストール
pnpm dev                    # 開発サーバ起動（Vite + ローカル D1）
pnpm build                  # 本番ビルド
pnpm preview                # ビルド成果物をローカルで確認（wrangler dev 相当）

pnpm lint                   # ESLint
pnpm typecheck              # tsc --noEmit
pnpm test                   # テスト

pnpm drizzle-kit generate   # マイグレーション生成
pnpm wrangler d1 migrations apply dartsspec   # D1 にマイグレーション適用
pnpm db:seed                # パーツマスタ投入（src/db/seed.ts）

pnpm wrangler deploy        # 本番デプロイ（Cloudflare Workers）
```

## 4. テスト方針

| 対象 | 方針 |
|---|---|
| 合算ロジック（`calcSpec`） | **ユニットテスト必須**。欠損値・端数・チップ有無を網羅 |
| API（settings / parts） | 認可（所有者チェック）と合算再計算の検証 |
| 動的 OGP | 生成が 200 を返すか・レイアウト崩れの目視確認 |
| E2E（任意） | 「登録→作成→公開→シェア」の主要導線 |

> リポジトリのコーディングガイドライン（`~/.claude/rules/coding-guideline.md`）に従い、**コード変更後は必ずテストを実行**する。合算ロジックはサービスの根幹ゆえ、テストの手を抜かないこと。

## 5. デプロイ手順（本番公開）

1. **D1 作成**: `wrangler d1 create dartsspec` で本番 DB を作成し、`wrangler.jsonc` の `d1_databases` に `database_id` を設定。
2. **シークレット**: `wrangler secret put BETTER_AUTH_SECRET` 等、秘匿値を登録（[04 §7](./04-architecture.md)、`.env` はコミットしない）。
3. **マイグレーション & seed**: `wrangler d1 migrations apply dartsspec` を本番に適用し、seed で本番マスタを投入。
4. **デプロイ**: `wrangler deploy` で Cloudflare Workers に公開。
5. **ドメイン**: 独自ドメイン（例: `dartsspec.example`）を Cloudflare の Workers Routes / Custom Domain に割り当てる。HTTPS は自動。
6. **OGP 確認**: 公開 URL を X の Card Validator 等で確認し、画像が表示されることを検証。
7. **本番スモークテスト**: 登録・作成・公開・シェアの一連を本番環境で通す。

## 6. CI / CD

- リポジトリには [`.github/workflows/ci.yml.example`](../.github/workflows/ci.yml.example) が同梱されている。`ci.yml` にリネームし、`pnpm lint` / `pnpm typecheck` / `pnpm test` を実行するよう調整する。
- デプロイは `wrangler deploy` を GitHub Actions（`cloudflare/wrangler-action` 等）に組み込み、`main` への push で自動化できる。Secret に `CLOUDFLARE_API_TOKEN` を設定する。
- Dependabot（[`.github/dependabot.yml`](../.github/dependabot.yml)）で依存を週次更新。TS リポなので npm + github-actions を対象にする。

## 7. リリース前チェックリスト

- [ ] 合算ロジックのユニットテストが緑
- [ ] 認可（他人のセッティングを編集 / 削除できない）を確認
- [ ] 公開ページが非ログインで閲覧できる
- [ ] 動的 OGP が主要 SNS（X / Discord）で正しく表示される
- [ ] モバイル表示が崩れていない
- [ ] `.env` / シークレットがコミットされていない（[git-guideline](../CLAUDE.md) 準拠）
- [ ] 独自ドメイン + HTTPS が有効
