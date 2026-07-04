# 05. 開発計画 / デプロイ

対応ステップ: **Step 4 — 開発とプロトタイピング（実装・デプロイ）**

[04. アーキテクチャ](./04-architecture.md) の設計をもとに、実際に動くシステムを構築してインターネット上に公開する。

## 1. 実装フェーズ（マイルストーン連動）

[00. ロードマップ](./00-roadmap.md) の M3〜M5 を具体化する。

### Phase A: 基盤構築（M3）

- [ ] Next.js + TypeScript + Tailwind の初期セットアップ（pnpm）
- [ ] Prisma スキーマ定義（`users` / `parts` / `settings`）とマイグレーション
- [ ] Supabase Auth（または Auth.js）で登録 / ログイン / ログアウト
- [ ] パーツマスタの seed 投入（[02](./02-parts-data.md) の CSV → `prisma/seed.ts`）
- **完了条件**: ユーザー登録・ログインが動作し、DB にパーツマスタが入っている。

### Phase B: コア機能（M4）

- [ ] `GET /api/parts` — カテゴリ別パーツ取得
- [ ] セッティング作成画面 — バレル/シャフト/フライト/チップのセレクトボックス
- [ ] リアルタイム合算表示（`lib/calcSpec.ts` を共有・Framer Motion でカウントアップ）
- [ ] `POST /api/settings` — サーバ側で合算再計算して保存
- [ ] マイページ（一覧）・編集・削除
- [ ] 公開ページ `/s/{id}`（非認証で閲覧可能・セッティングカード表示）
- **完了条件**: 「選択 → 合算 → 保存 → 公開 URL 閲覧」が一気通貫で通る。

### Phase C: 動的 OGP & シェア（M5）

- [ ] `GET /api/og/{id}` — `next/og` で PNG 動的生成（[03 §6](./03-design-system.md)）
- [ ] 公開ページに OGP メタタグ付与（`summary_large_image`）
- [ ] シェアボタン（X Web Intent・URL コピー）を作成完了 / マイページに大きく配置
- [ ] OGP のキャッシュ制御・日本語フォントのサブセット化
- **完了条件**: SNS に公開 URL を貼ると、セッティング内容がカード画像で表示される。

## 2. 環境構成

| 環境 | 用途 | ブランチ | ホスティング |
|---|---|---|---|
| local | 開発 | feature ブランチ | `pnpm dev` |
| preview | PR レビュー / 動作確認 | PR ごと | Vercel Preview Deploy |
| production | 本番 | `main` | Vercel Production |

- Vercel は PR ごとに **Preview URL** を自動発行するため、OGP や UI をレビュー段階で実機確認できる。

## 3. 開発コマンド（想定）

実装確定後、[CLAUDE.md](../CLAUDE.md) と [package.json](../package.json) に反映する。

```sh
pnpm install          # 依存インストール
pnpm dev              # 開発サーバ起動
pnpm build            # 本番ビルド
pnpm start            # 本番サーバ起動（ローカル確認）

pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm test             # テスト

pnpm prisma migrate dev   # マイグレーション
pnpm prisma db seed       # パーツマスタ投入
pnpm prisma studio        # DB GUI
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

1. **ホスティング設定**: Vercel にリポジトリを接続し、`main` を production に紐付け。
2. **環境変数**: Vercel のプロジェクト設定に [04 §7](./04-architecture.md) の環境変数を登録（`.env` はコミットしない）。
3. **DB**: Supabase / Neon 等で production DB を用意し、`prisma migrate deploy` を実行。seed で本番マスタを投入。
4. **ドメイン**: 独自ドメイン（例: `dartsspec.app`）を Vercel に設定し、DNS を向ける。HTTPS は自動。
5. **OGP 確認**: 公開 URL を X の Card Validator 等で確認し、画像が表示されることを検証。
6. **本番スモークテスト**: 登録・作成・公開・シェアの一連を本番環境で通す。

## 6. CI / CD

- リポジトリには [`.github/workflows/ci.yml.example`](../.github/workflows/ci.yml.example) が同梱されている。`ci.yml` にリネームし、`pnpm lint` / `pnpm typecheck` / `pnpm test` を実行するよう調整する。
- Vercel が push / PR を検知して自動デプロイするため、デプロイ用の追加 CI は最小限でよい。
- Dependabot（[`.github/dependabot.yml`](../.github/dependabot.yml)）で依存を週次更新。TS リポなので npm + github-actions を対象にする。

## 7. リリース前チェックリスト

- [ ] 合算ロジックのユニットテストが緑
- [ ] 認可（他人のセッティングを編集 / 削除できない）を確認
- [ ] 公開ページが非ログインで閲覧できる
- [ ] 動的 OGP が主要 SNS（X / Discord）で正しく表示される
- [ ] モバイル表示が崩れていない
- [ ] `.env` / シークレットがコミットされていない（[git-guideline](../CLAUDE.md) 準拠）
- [ ] 独自ドメイン + HTTPS が有効
