# darts spec ドキュメント

ダーツ・マイセッティング共有プラットフォーム **darts spec** の設計・企画ドキュメント一式でござる。

> 「自分のダーツセッティング（バレル・シャフト・フライト・チップ）を記録でき、URL ひとつで SNS に美しくシェアできる」——この一点にコア価値を絞ったサービスである。

## ディレクトリ構成

| パス | 役割 |
|---|---|
| [`content/`](./content/) | ドキュメント本体（Markdown）。編集先は常にこちら |
| [`site/`](./site/) | `content/` を配信する Nimbus 製ドキュメントサイト。複製は持たず直接読む |

## ドキュメントサイトの起動

```sh
cd docs/site
pnpm install    # 初回のみ
pnpm run dev    # http://localhost:4321
```

`docs/content/*.md` を編集すると HMR で即座に反映される。

dev サーバは常駐デーモンとして動くため、操作には専用サブコマンドを使う。

| コマンド | 用途 |
|---|---|
| `pnpm exec astro dev status` | 稼働確認 |
| `pnpm exec astro dev logs` | ログ追尾 |
| `pnpm exec astro dev stop` | 停止 |

主なルートは以下。

| パス | 内容 |
|---|---|
| `/` | トップ |
| `/00-roadmap/` 〜 `/06-launch-plan/` | 各ドキュメント |
| `/llms.txt` | AI 向けのドキュメント索引 |

> frontmatter や `astro.config.ts` を変更した際は Content Layer のキャッシュが効いて反映されないことがある。その場合は `astro dev stop` して起動し直すか、ビルド検証なら `pnpm exec astro build --force` を使う。

### その他のコマンド

| コマンド | 内容 |
|---|---|
| `pnpm run build` | 静的ビルド（`dist/`）。Pagefind の検索インデックスもここで生成される |
| `pnpm run typecheck` | `astro check`。本体の `pnpm run typecheck` はここを対象外にしている |
| `pnpm run lint:docs` | frontmatter の妥当性と内部リンク切れを検査 |
| `pnpm run deploy` | Cloudflare Workers（`dartsspec-docs`）へデプロイ |

## コンセプト

既存のダーツ関連サイト（ガチャガチャした EC サイト風）にはない **モダンさ** を最大の武器とし、ダーツプレイヤーが「シェアしたくなる」体験を提供する CGM（Consumer Generated Media）プラットフォームである。

## ドキュメント一覧

サービス立ち上げの時系列に沿って番号を振っている。上から順に読むと全体像が掴めるようにしてある。

| # | ドキュメント | 内容 | 対応ステップ |
|---|---|---|---|
| 00 | [ロードマップ](./content/00-roadmap.md) | 全体マイルストーンと進行管理 | 全体 |
| 01 | [プロダクト要求仕様（PRD）](./content/01-product-requirements.md) | コア価値・MVP スコープ・スコープ外の線引き | Step 1 |
| 02 | [パーツデータ設計](./content/02-parts-data.md) | 対象ブランド選定・データ収集方針・マスタスキーマ | Step 2 |
| 03 | [デザインシステム / UI・UX](./content/03-design-system.md) | ビジュアル方針・カラー・タイポグラフィ・シェア動線・OGP | Step 3 |
| 04 | [アーキテクチャ / 技術スタック](./content/04-architecture.md) | 技術選定・DB 設計・認証・API 設計 | Step 4 |
| 05 | [開発計画 / デプロイ](./content/05-development-plan.md) | 実装フェーズ・環境構成・デプロイ手順 | Step 4 |
| 06 | [ローンチ計画](./content/06-launch-plan.md) | クローズドテスト・SNS ローンチ・グロース戦略 | Step 5 |

## ドキュメントの位置づけ

- `content/` は、実装コードが参照する **単一の真実（source of truth）** である。
- コードがまだ存在しないフェーズでは、ここに書かれた仕様が実装の指針となる。
- 実装が進んだ後は、仕様変更のたびに該当ドキュメントを更新し、コードとドキュメントの乖離を防ぐこと。

## 関連ファイル

- [`../README.md`](../README.md) — リポジトリのトップ README
- [`../CLAUDE.md`](../CLAUDE.md) — Claude Code へのプロジェクト固有指示
- [`../tasks/`](../tasks/) — 作業記録（todo.md / lessons.md）
