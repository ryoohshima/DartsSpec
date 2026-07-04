# 04. アーキテクチャ / 技術スタック

対応ステップ: **Step 4 — 開発とプロトタイピング（データベースと認証の構築）**

「個人開発で最速リリース」と「動的 OGP の実現」を両立するアーキテクチャを定義する。技術選定は **動的 OGP 要件から逆算**して行う（サーバーサイド画像生成が必須のため）。

## 1. 技術スタック（推奨案）

| レイヤ | 採用（推奨） | 理由 |
|---|---|---|
| 言語 | **TypeScript** | 型安全・フロント/バック共通言語 |
| フレームワーク | **Next.js（App Router）** | SSR + 動的 OGP（`next/og`）+ API を 1 つで完結 |
| UI | **React + Tailwind CSS** | デザイントークンの一元管理・高速な UI 構築 |
| アニメーション | **Framer Motion** | 数値カウントアップ等のインタラクティブ表現 |
| DB | **PostgreSQL**（Supabase / Neon / Vercel Postgres 等） | リレーショナルで整合性が高い |
| ORM | **Prisma** | 型安全なスキーマ駆動開発・マイグレーション・seed |
| 認証 | **Supabase Auth** または **Auth.js（NextAuth）** | メール + OAuth を低実装で実現 |
| 動的 OGP | **`next/og`（`ImageResponse`）** | エッジで PNG を動的生成 |
| ホスティング | **Vercel** | Next.js との親和性・エッジ関数・OGP 生成が容易 |
| パッケージ管理 | **pnpm** | 高速・省ディスク（リポジトリ既定と整合） |

> **代替案**: バックエンドを厚くしたい場合は「Next.js（フロント） + 別 API（Express/Hono）」も可。ただし MVP では Next.js に集約し、依存とデプロイ対象を最小化するのが最速。判断は [00. ロードマップ](./00-roadmap.md) の「最速リリース優先」に従う。

## 2. システム構成図

```
        ┌─────────────────────────────────────────────┐
        │                 Vercel                       │
        │  ┌──────────────┐   ┌──────────────────────┐ │
  User ─┼─▶│ Next.js      │   │ Route Handlers (API) │ │
        │  │  (SSR/CSR)   │──▶│  /api/settings ...   │ │
        │  └──────────────┘   │  /api/og/{id} (OGP)  │ │
        │         │           └──────────┬───────────┘ │
        └─────────┼──────────────────────┼─────────────┘
                  │                      │
                  ▼                      ▼
        ┌──────────────┐        ┌──────────────────┐
        │ Supabase Auth│        │ PostgreSQL (DB)  │
        │ (認証)       │        │ users/parts/     │
        └──────────────┘        │ settings         │
                                └──────────────────┘
   SNS が /s/{id} を取得 ──▶ og:image が /api/og/{id} を叩き PNG 生成
```

## 3. データベース設計

[02. パーツデータ設計](./02-parts-data.md) のスキーマを、リレーショナルに落とし込む。

### 3.1 ER 概要

```
users (1) ───< (N) settings (N) >─── parts
                     │
                     └── barrel_id / shaft_id / flight_id / tip_id で parts を参照
```

- `users` 1 人が複数 `settings` を持つ（1:N）。
- `settings` は各パーツ種別につき `parts` を 1 件ずつ参照する（各 nullable 外部キー）。

### 3.2 テーブル定義

#### `users`

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | UUID | PK | ユーザー ID |
| `handle` | string | UNIQUE | 表示用ハンドル（`@user`） |
| `display_name` | string? | | 表示名 |
| `email` | string | UNIQUE | メール（認証で使用） |
| `avatar_url` | string? | | アバター |
| `created_at` | timestamp | | 登録日時 |

> Supabase Auth を使う場合、認証情報は Supabase 側 `auth.users` が管理し、本テーブルはプロフィールとして 1:1 で紐づける運用にできる。

#### `parts`（マスタ）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | UUID | PK | パーツ ID |
| `category` | enum | NOT NULL | `barrel`/`shaft`/`flight`/`tip` |
| `brand` | string | NOT NULL | ブランド |
| `series` | string? | | シリーズ |
| `name` | string | NOT NULL | 製品名 |
| `standard` | string? | | 互換規格 |
| `spec` | jsonb | NOT NULL | 種別固有スペック（[02](./02-parts-data.md) 参照） |
| `image_url` | string? | | 画像 |
| `is_active` | boolean | DEFAULT true | 表示可否 |
| `created_at` | timestamp | | 登録日時 |

- インデックス: `(category, brand)`, `(name)`。セレクトボックスの絞り込みで使用。

#### `settings`（ユーザーのセッティング）

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | UUID | PK | セッティング ID（公開 URL の識別子） |
| `user_id` | UUID | FK → users | 所有者 |
| `title` | string | NOT NULL | セッティング名 |
| `barrel_id` | UUID? | FK → parts | バレル |
| `shaft_id` | UUID? | FK → parts | シャフト |
| `flight_id` | UUID? | FK → parts | フライト |
| `tip_id` | UUID? | FK → parts | チップ |
| `total_weight_g` | numeric | | 保存時に確定した合算総重量 |
| `total_length_mm` | numeric | | 保存時に確定した合算全長 |
| `visibility` | enum | DEFAULT 'public' | `public`/`private` |
| `created_at` | timestamp | | 作成日時 |
| `updated_at` | timestamp | | 更新日時 |

- **合算値の保存方針**: `total_weight_g` / `total_length_mm` を保存時にサーバ側で計算して**非正規化保存**する。理由は (1) 公開ページ / OGP 生成を高速化、(2) 後日パーツのマスタ値が変わっても「作成時点のスペック」を保持できるため。
- 公開 URL は `settings.id` を用いる。推測されにくくしたい場合は UUID か、別途 `slug`（ランダム短縮 ID）を持たせる。

### 3.3 Prisma スキーマ（抜粋イメージ）

```prisma
enum PartCategory { barrel shaft flight tip }
enum Visibility   { public private }

model Part {
  id        String       @id @default(uuid())
  category  PartCategory
  brand     String
  series    String?
  name      String
  standard  String?
  spec      Json
  imageUrl  String?      @map("image_url")
  isActive  Boolean      @default(true) @map("is_active")
  createdAt DateTime     @default(now()) @map("created_at")
  @@index([category, brand])
  @@map("parts")
}

model Setting {
  id            String     @id @default(uuid())
  userId        String     @map("user_id")
  title         String
  barrelId      String?    @map("barrel_id")
  shaftId       String?    @map("shaft_id")
  flightId      String?    @map("flight_id")
  tipId         String?    @map("tip_id")
  totalWeightG  Decimal?   @map("total_weight_g")
  totalLengthMm Decimal?   @map("total_length_mm")
  visibility    Visibility @default(public)
  createdAt     DateTime   @default(now()) @map("created_at")
  updatedAt     DateTime   @updatedAt @map("updated_at")
  @@map("settings")
}
```

## 4. 認証設計

- MVP は **メール + パスワード**、または **OAuth（Google / X）** を Supabase Auth / Auth.js で実装。
- パスワードは BaaS 側でハッシュ化保存（自前でハッシュ実装しない）。
- セッションは HttpOnly Cookie で管理。
- **公開ページ（`/s/{id}`）と OGP は非認証で閲覧可能**、**作成 / 編集 / 削除は認証必須**。
- 認可: セッティングの編集・削除は所有者（`user_id` 一致）のみ。Supabase を使う場合は **RLS（Row Level Security）** でも二重に守る。

## 5. API 設計（Route Handlers）

Next.js の Route Handlers（`app/api/...`）で実装する REST 風エンドポイント。

| メソッド | パス | 認証 | 説明 |
|---|---|---|---|
| `GET` | `/api/parts?category=barrel&brand=...` | 不要 | パーツ一覧（セレクトボックス用） |
| `POST` | `/api/settings` | 必要 | セッティング作成（サーバ側で合算再計算） |
| `GET` | `/api/settings/{id}` | 条件付 | セッティング取得（public は誰でも） |
| `PATCH` | `/api/settings/{id}` | 必要（所有者） | 編集 |
| `DELETE` | `/api/settings/{id}` | 必要（所有者） | 削除 |
| `GET` | `/api/settings/me` | 必要 | 自分の一覧（マイページ） |
| `GET` | `/api/og/{id}` | 不要 | 動的 OGP 画像（PNG）生成 |

### 合算の二重計算（重要）

- フロント: 選択に応じて**リアルタイム表示**（体験のため）。
- サーバ: 保存時に `parts` の実値から**再計算**して `settings` に保存（改ざん防止・整合性）。
- 合算ロジックは [02. パーツデータ設計 §4](./02-parts-data.md) を単一の仕様とし、フロント / サーバで**同一の関数**を共有（例: `lib/calcSpec.ts`）。

## 6. ディレクトリ構成（実装時の想定）

リポジトリ既定の `src/` / `tests/` / `docs/` / `tasks/` を踏襲する。

```
.
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (marketing)/     # LP
│   │   ├── s/[id]/          # 公開セッティングページ（OGP 対象）
│   │   ├── settings/        # 作成・編集・マイページ
│   │   └── api/             # Route Handlers（parts / settings / og）
│   ├── components/          # UI（SettingCard 等）
│   ├── lib/                 # calcSpec.ts, db.ts, auth.ts
│   └── styles/              # Tailwind / トークン
├── prisma/
│   ├── schema.prisma
│   └── seed.ts              # パーツマスタ投入（02 の CSV から）
├── tests/
└── docs/
```

## 7. 環境変数（想定）

`.env.example` に雛形を用意し、`.env` はコミットしない（[.gitignore](../.gitignore) で除外済み）。

```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # サーバ専用・秘匿
NEXT_PUBLIC_SITE_URL=https://dartsspec.app
```

## 8. 技術的な決定事項と保留

- [ ] DB / 認証を **Supabase 一本**にするか、**Neon + Auth.js** にするか（どちらも可、Supabase は認証込みで最速）。
- [ ] 公開識別子を `UUID` そのままにするか `slug` を別途持たせるか。
- [ ] ORM を Prisma にするか Drizzle にするか（型安全ならどちらも可、seed の書きやすさで Prisma 推奨）。

> これらは実装着手前（M3 手前）に確定させる。決めたら本ドキュメントと [CLAUDE.md](../CLAUDE.md) の技術スタック欄を更新すること。
