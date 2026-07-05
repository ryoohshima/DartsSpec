# プロジェクト固有の Claude Code 指示

このファイルは本プロジェクトに固有のルール・コンテキストを Claude Code に伝えるためのものでござる。
全プロジェクト共通のガイドラインは `~/.claude/CLAUDE.md` に記載されており、本ファイルはそれを補完する形で記述するでござる。

## プロジェクト概要

ダーツのマイセッティング（バレル / シャフト / フライト / チップ）を作成・保存し、公開 URL と動的 OGP で SNS にシェアできる CGM サービス。

サービス正式名称: **darts spec**（決定済み、#4）。ドメインは未確定（取得作業は #41）。

## 技術スタック

詳細と選定理由は [docs/04-architecture.md](./docs/04-architecture.md) を参照。

- 言語: TypeScript
- フレームワーク: TanStack Start v1（React + TanStack Router / Query）+ Tailwind CSS + Framer Motion
- ホスティング / DB: Cloudflare Workers + D1（SQLite）、ORM は Drizzle
- 認証: better-auth（メール+パスワード + Google OAuth）
- 動的 OGP: workers-og（Satori + resvg-wasm）
- テスト: vitest
- パッケージマネージャ: pnpm

## ディレクトリ構成

<!-- 主要ディレクトリの役割を簡潔に記述 -->

```
.
├── src/           # ソースコード
├── tests/         # テストコード
├── docs/          # ドキュメント
└── tasks/         # Claude Code 作業記録（todo.md / lessons.md）
```

## 開発コマンド

```sh
# 起動（Workers ランタイム + ローカル D1）
pnpm dev

# テスト
pnpm test

# Type check
pnpm typecheck

# ビルド
pnpm build

# DB（ローカル D1）
pnpm db:migrate   # マイグレーション適用
pnpm db:seed      # パーツマスタ投入
```

## このリポジトリ固有の注意事項

- **Cloudflare Workers 前提**: Node API 依存のライブラリは避ける。WASM は static import（docs/04 §1）。
- **D1 に RLS はない**: 認可は必ず server function 内で `session.user.id` と `settings.user_id` を突き合わせる（docs/04 §4）。
- **合算ロジックは docs/02 §4 が唯一の仕様**: フロント / サーバで `src/lib/calcSpec.ts` を共有し、保存時はサーバで再計算する。
- **パーツマスタは開発用モックデータ**: 実測未検証（正式な品質チェックは #11）。

## 参照ドキュメント

<!-- README, アーキテクチャドキュメント、外部参照など -->

- [README.md](./README.md)
