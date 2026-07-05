# 04. アーキテクチャ / 技術スタック

対応ステップ: **Step 4 — 開発とプロトタイピング（データベースと認証の構築）**

「個人開発で最速リリース」と「動的 OGP の実現」を両立するアーキテクチャを定義する。技術選定は **動的 OGP 要件**（サーバーサイド画像生成が必須）と **完全無料・エッジネイティブ**（Cloudflare 無料枠）から逆算して行う。

## 1. 技術スタック

**全面 TanStack + 全面 Cloudflare** の一枚岩構成とする。外部サービス依存ゼロ・完全無料・型安全 end-to-end を狙う。

| レイヤ | 採用 | 理由 |
|---|---|---|
| 言語 | **TypeScript** | 型安全・フロント/バック共通言語 |
| フレームワーク | **TanStack Start（v1）** | SSR + server functions + Vite ベース。Router / Query と一体運用でき、RSC の住み分けが不要 |
| ルーティング | **TanStack Router** | 型安全なファイルベースルーティング（`src/routes/`） |
| UI | **React + Tailwind CSS** | デザイントークンの一元管理・高速な UI 構築 |
| データフェッチ | **TanStack Query** | SSR ローダーと連携したキャッシュ・再検証・mutation・楽観的更新（用途は §5.1） |
| アニメーション | **Framer Motion** | 数値カウントアップ等のインタラクティブ表現 |
| ホスティング | **Cloudflare Workers（無料枠）** | 100k req/日の無料枠・商用可・エッジ実行。Nitro `cloudflare-module` / `@cloudflare/vite-plugin` で `wrangler deploy` |
| DB | **Cloudflare D1（SQLite）** | Workers ネイティブ・無料枠（5GB / 500万行読取毎日）。本サービスの小規模データに好適 |
| ORM | **Drizzle ORM** | Workers / D1 を第一級サポート・軽量・型安全・マイグレーション（drizzle-kit） |
| 認証 | **better-auth（D1 アダプタ）** | メール+パスワード / OAuth をエッジで完結。認証テーブルを D1 に生成 |
| 動的 OGP | **workers-og（Satori + resvg-wasm）** | Workers 上で WASM 完結の OG 画像生成。`@vercel/og` 風 API |
| パッケージ管理 | **pnpm** | 高速・省ディスク（リポジトリ既定と整合） |

> **なぜこの構成か**: 公開ページの共有（CGM）が本サービスの核であり、SSR による SEO/初期表示と動的 OGP が要る。TanStack Start はこれを Cloudflare Workers 上で実現でき、Query をネイティブに統合できる。DB を D1 に寄せることで外部依存が消え、完全無料でエッジに閉じる。判断は [00. ロードマップ](./00-roadmap.md) の「最速リリース優先」に従う。

### エッジランタイム上の留意点（Cloudflare Workers）

- **WASM は動的コンパイル不可**。OGP の Satori/resvg は static import で wrangler に事前コンパイルさせる。
- **Node API 前提のライブラリは避ける**。必要時は `nodejs_compat` フラグを検討。
- **D1 は SQLite**。Postgres 固有機能（jsonb・enum 型・`gen_random_uuid()`）は使わず、SQLite の表現に置き換える（§3）。

## 2. システム構成図

```
        ┌─────────────────────────────────────────────────────┐
        │             Cloudflare Workers（無料枠）              │
        │  ┌────────────────────┐   ┌───────────────────────┐  │
  User ─┼─▶│ TanStack Start     │   │ Server routes/fns     │  │
        │  │  SSR + Router      │──▶│  parts / settings     │  │
        │  │  + TanStack Query  │   │  /api/og/{id}(OGP)    │  │
        │  └────────────────────┘   └───────────┬───────────┘  │
        │           │                           │              │
        │           ▼                           ▼              │
        │  ┌────────────────┐         ┌────────────────────┐   │
        │  │ better-auth    │         │ Cloudflare D1      │   │
        │  │ (D1 に認証表)  │────────▶│ (SQLite)           │   │
        │  └────────────────┘         │ user/session/parts │   │
        │  ┌────────────────┐         │ /settings          │   │
        │  │ workers-og     │         └────────────────────┘   │
        │  │ (Satori+resvg) │  D1 binding: env.context.cloudflare│
        │  └────────────────┘                                  │
        └─────────────────────────────────────────────────────┘
   SNS が /s/{id} を取得 ──▶ og:image が /api/og/{id} を叩き PNG 生成
```

## 3. データベース設計（Cloudflare D1 / SQLite）

[02. パーツデータ設計](./02-parts-data.md) のスキーマを、D1（SQLite）と Drizzle に落とし込む。SQLite に合わせ、型は以下の方針で置き換える。

| 論理型 | SQLite/D1 での表現 | 備考 |
|---|---|---|
| UUID | `TEXT`（`crypto.randomUUID()`） | Workers で生成 |
| enum | `TEXT` + `CHECK` 制約 | SQLite に enum 型はない |
| JSON | `TEXT`（JSON 文字列） | Drizzle の `text({ mode: 'json' })` で型付き扱い |
| 数値（重量/長さ） | `REAL` | 小数を保持 |
| 真偽 | `INTEGER`（0/1） | SQLite に boolean 型はない |
| 日時 | `INTEGER`（unix epoch） | Drizzle の `integer({ mode: 'timestamp' })` |

### 3.1 ER 概要

```
user (1) ───< (N) settings (N) >─── parts
                     │
                     └── barrel_id / shaft_id / flight_id / tip_id で parts を参照
```

- `user` 1 人が複数 `settings` を持つ（1:N）。※`user` は better-auth が生成するテーブル。
- `settings` は各パーツ種別につき `parts` を 1 件ずつ参照する（各 nullable 外部キー）。

### 3.2 テーブル定義

#### `user`（better-auth 管理 + プロフィール拡張）

better-auth が `user` / `session` / `account` / `verification` を D1 に生成する。アプリ固有のプロフィール列を `user` に追加（または 1:1 の `profile` テーブルとして持つ）。

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | TEXT | PK | ユーザー ID（better-auth 発行） |
| `name` | TEXT | | 表示名（better-auth 標準） |
| `email` | TEXT | UNIQUE | メール（better-auth 標準） |
| `image` | TEXT? | | アバター（better-auth 標準） |
| `handle` | TEXT | UNIQUE | 表示用ハンドル（`@user`）※アプリ拡張 |
| `created_at` | INTEGER | | 登録日時（epoch） |

> `session` / `account` / `verification` は better-auth のスキーマに従う（本ドキュメントでは詳細割愛）。

#### `parts`（マスタ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | TEXT | PK | パーツ ID |
| `category` | TEXT | NOT NULL + CHECK | `barrel`/`shaft`/`flight`/`tip` |
| `brand` | TEXT | NOT NULL | ブランド |
| `series` | TEXT? | | シリーズ |
| `name` | TEXT | NOT NULL | 製品名 |
| `standard` | TEXT? | | 互換規格 |
| `spec` | TEXT(JSON) | NOT NULL | 種別固有スペック（[02](./02-parts-data.md) 参照） |
| `image_url` | TEXT? | | 画像 |
| `is_active` | INTEGER | DEFAULT 1 | 表示可否（0/1） |
| `created_at` | INTEGER | | 登録日時（epoch） |

- インデックス: `(category, brand)`, `(name)`。セレクトボックスの絞り込みで使用。

#### `settings`（ユーザーのセッティング）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | TEXT | PK | セッティング ID（公開 URL の識別子） |
| `user_id` | TEXT | FK → user | 所有者 |
| `title` | TEXT | NOT NULL | セッティング名 |
| `barrel_id` | TEXT? | FK → parts | バレル |
| `shaft_id` | TEXT? | FK → parts | シャフト |
| `flight_id` | TEXT? | FK → parts | フライト |
| `tip_id` | TEXT? | FK → parts | チップ |
| `total_weight_g` | REAL | | 保存時に確定した合算総重量 |
| `total_length_mm` | REAL | | 保存時に確定した合算全長 |
| `visibility` | TEXT | DEFAULT 'public' + CHECK | `public`/`private` |
| `created_at` | INTEGER | | 作成日時（epoch） |
| `updated_at` | INTEGER | | 更新日時（epoch） |

- **合算値の保存方針**: `total_weight_g` / `total_length_mm` を保存時にサーバ側で計算して**非正規化保存**する。理由は (1) 公開ページ / OGP 生成を高速化、(2) 後日パーツのマスタ値が変わっても「作成時点のスペック」を保持できるため。
- 公開 URL は `settings.id` を用いる。推測されにくくしたい場合は UUID か、別途 `slug`（ランダム短縮 ID）を持たせる。

### 3.3 Drizzle スキーマ（抜粋イメージ）

```typescript
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core'

export const parts = sqliteTable('parts', {
  id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  category:  text('category', { enum: ['barrel', 'shaft', 'flight', 'tip'] }).notNull(),
  brand:     text('brand').notNull(),
  series:    text('series'),
  name:      text('name').notNull(),
  standard:  text('standard'),
  spec:      text('spec', { mode: 'json' }).$type<PartSpec>().notNull(),
  imageUrl:  text('image_url'),
  isActive:  integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const settings = sqliteTable('settings', {
  id:            text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:        text('user_id').notNull().references(() => user.id),
  title:         text('title').notNull(),
  barrelId:      text('barrel_id').references(() => parts.id),
  shaftId:       text('shaft_id').references(() => parts.id),
  flightId:      text('flight_id').references(() => parts.id),
  tipId:         text('tip_id').references(() => parts.id),
  totalWeightG:  real('total_weight_g'),
  totalLengthMm: real('total_length_mm'),
  visibility:    text('visibility', { enum: ['public', 'private'] }).default('public'),
  createdAt:     integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt:     integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

> `category` / `visibility` は Drizzle の `enum` オプションで型を絞りつつ、生成 DDL では `TEXT`（+ 任意で CHECK）になる。`spec` は `mode: 'json'` + `$type` でアプリ層は型付き、DB 層は TEXT。

## 4. 認証設計（better-auth on D1）

- **better-auth** を D1 アダプタで用いる。メール+パスワード、必要に応じ OAuth（Google / X）を有効化。
- 認証テーブル（`user` / `session` / `account` / `verification`）は better-auth が D1 に生成・管理する。
- パスワードのハッシュ化・セッション管理は better-auth に委ねる（自前実装しない）。セッションは Cookie ベース。
- **公開ページ（`/s/{id}`）と OGP は非認証で閲覧可能**。
- **セッティング作成画面自体も非認証で利用可能**（パーツ選択・合算プレビューまで）。**認証が必須なのは永続化する `createSetting`（保存）以降** — 編集 / 削除 / マイページも同様に認証必須。非ログインで保存を試みた場合の挙動（下書きの `localStorage` 保持 → ログイン誘導 → 復帰後に自動保存）は [01. プロダクト要求仕様 §4.3](./01-product-requirements.md#43-非ログインお試し体験とログイン誘導フロー確定) を参照。
- 認可: セッティングの編集・削除は所有者（`user_id` 一致）のみ。**server function 内で `session.user.id` と `settings.user_id` を突き合わせて検証**する（Supabase RLS のような DB 層ポリシーは D1 にないため、サーバー関数で必ず担保）。

## 5. API 設計（server routes / server functions）

TanStack Start の **server functions**（`createServerFn`）と **server routes**（`src/routes/api/...`）で実装する。データ取得系は Query から server function を呼び、OGP は専用 server route とする。

| 種別 | パス / 関数 | 認証 | 説明 |
|---|---|---|---|
| server fn | `getParts({ category, brand })` | 不要 | パーツ一覧（セレクトボックス用） |
| server fn | `createSetting(input)` | 必要 | セッティング作成（サーバ側で合算再計算） |
| server fn | `getSetting({ id })` | 条件付 | セッティング取得（public は誰でも） |
| server fn | `updateSetting({ id, ... })` | 必要（所有者） | 編集 |
| server fn | `deleteSetting({ id })` | 必要（所有者） | 削除 |
| server fn | `getMySettings()` | 必要 | 自分の一覧（マイページ） |
| server route | `GET /api/og/{id}` | 不要 | 動的 OGP 画像（PNG）生成（workers-og） |

> REST 風のエンドポイントが必要なら server route（`src/routes/api/*`）でも実装可能。MVP では型安全な server function を主とし、外部公開 API 的な用途のみ route を使う。

### 合算の二重計算（重要）

- フロント: 選択に応じて**リアルタイム表示**（体験のため）。
- サーバ: 保存時（`createSetting` / `updateSetting`）に `parts` の実値から**再計算**して `settings` に保存（改ざん防止・整合性）。
- 合算ロジックは [02. パーツデータ設計 §4](./02-parts-data.md) を単一の仕様とし、クライアント / server function で**同一の関数**を共有（例: `src/lib/calcSpec.ts`）。同一バンドルから import できる Start の利点を活かす。

### 5.1 データフェッチ戦略（SSR ローダー × TanStack Query）

TanStack Start は RSC を持たない（v1.0 時点）。代わりに **SSR のルートローダーが初期データを積み、以降のキャッシュ・再検証・mutation を TanStack Query が引き継ぐ**。RSC と Query の「住み分け」に悩む必要がなく、一本の流れになるのが本構成の利点である。

| 対象 | 方式 | 理由 |
|---|---|---|
| 公開ページ `/s/{id}` | **ルートローダー（SSR）で取得** | SEO・初期表示。`loader` で D1 から取得し HTML に載せる |
| 動的 OGP `/api/og/{id}` | **server route で生成** | Workers 上で workers-og が PNG 生成（[03 §6](./03-design-system.md)） |
| LP・静的コンテンツ | **静的 / SSR** | クライアント状態を持たない |
| パーツマスタ取得（セレクトボックス） | **TanStack Query** | マスタはほぼ不変。`staleTime` を長く取り再取得・重複フェッチを抑制 |
| セッティング作成 / 編集 / 削除 | **TanStack Query（`useMutation`）** | 保存後にマイページ一覧を invalidation で自動最新化。楽観的更新で体感を向上 |
| マイページ一覧 | **ローダー + Query** | ローダーで初期表示、Query でキャッシュ・再検証 |

#### 実装上の指針

- **ローダーと Query の橋渡し**: ルート `loader` 内で `queryClient.ensureQueryData(...)` を呼び、SSR で温めたキャッシュを `dehydrate` → クライアントで `hydrate` する（Start + Query の定番連携）。二重フェッチを防ぐ。
- `QueryClientProvider` はルートツリー最上位（`src/router.tsx` の `Wrap`）に配置する。
- パーツマスタは変更頻度が極めて低いため `staleTime` を長時間（実質恒久）に設定し、`getParts` の呼び出しを最小化する。
- mutation 成功時は関連クエリキー（`['settings', 'me']` 等）を `invalidateQueries` で再検証する。
- 手書きの `useQuery` フックは採用しない。stale データや二重フェッチのバグ温床になるため、TanStack Query に委ねる。

## 6. ディレクトリ構成（実装時の想定）

リポジトリ既定の `src/` / `tests/` / `docs/` / `tasks/` を踏襲する。TanStack Start のファイルベースルーティングに合わせる。

```
.
├── src/
│   ├── routes/              # TanStack Router（ファイルベース）
│   │   ├── index.tsx        # LP
│   │   ├── s/$id.tsx        # 公開セッティングページ（loader で SSR・OGP 対象）
│   │   ├── settings/        # 作成・編集・マイページ
│   │   └── api/
│   │       └── og/$id.ts    # 動的 OGP（workers-og）server route
│   ├── server/              # server functions（getParts / createSetting ...）
│   ├── db/
│   │   ├── schema.ts        # Drizzle スキーマ（parts / settings ...）
│   │   └── seed.ts          # パーツマスタ投入（02 の CSV から）
│   ├── components/          # UI（SettingCard 等）
│   ├── hooks/               # useParts / useSettings 等（TanStack Query ラッパ）
│   ├── lib/                 # calcSpec.ts, auth.ts, og.ts（workers-og）
│   ├── router.tsx           # QueryClientProvider 等のルート Wrap
│   └── styles/              # Tailwind / トークン
├── drizzle/                 # drizzle-kit マイグレーション成果物
├── wrangler.jsonc           # Cloudflare 設定（D1 バインディング等）
├── tests/
└── docs/
```

## 7. 環境変数 / バインディング（想定）

- D1 は **wrangler のバインディング**として注入し、`event.context.cloudflare.env.DB` から参照する（`DATABASE_URL` は使わない）。
- 秘匿値（OAuth シークレット等）は `wrangler secret put` で登録。
- クライアント公開変数は Vite 規約に従い **`VITE_` プレフィックス**。
- `.env` はコミットしない（[.gitignore](../.gitignore) で除外済み）。

```jsonc
// wrangler.jsonc（抜粋）
{
  "d1_databases": [
    { "binding": "DB", "database_name": "dartsspec", "database_id": "<id>" }
  ]
}
```

```
# .env.example（クライアント公開 + ローカル用）
VITE_SITE_URL=https://dartsspec.example
BETTER_AUTH_SECRET=...          # サーバ専用・秘匿（本番は wrangler secret）
BETTER_AUTH_URL=https://dartsspec.example
# OAuth を使う場合
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...         # wrangler secret
```

## 8. 技術的な決定事項と保留

- [ ] 公開識別子を `crypto.randomUUID()` そのままにするか、短い `slug`（共有 URL を短く）を別途持たせるか。
- [ ] 認証は **メール+パスワードのみ**で始めるか、初期から **OAuth（Google / X）** も出すか。
- [ ] OGP 生成の日本語フォントを D1/R2 のどこに置き、どうサブセット化して Worker バンドルに載せるか（[03 §6](./03-design-system.md)）。
- [x] サービス正式名称（**darts spec** に決定、#4）。
- [ ] ドメイン（本ドキュメントでは仮に `dartsspec.example`、取得作業は #41）。

> これらは実装着手前（M3 手前）に確定させる。決めたら本ドキュメントと [CLAUDE.md](../CLAUDE.md) の技術スタック欄を更新すること。
