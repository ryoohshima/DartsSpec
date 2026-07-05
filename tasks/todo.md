# GitHub Issue 一括実装（darts spec アプリ実装）

計画: `~/.claude/plans/peppy-coalescing-bengio.md`

ベースブランチ: `develop`（デフォルトブランチ。origin/main は古い）

## TODO

### PR1 `docs/design-and-brand-decisions`（base: develop）→ #57
- [x] #9 対象ブランド確定を docs/02 に反映
- [x] #14 カラートークン確定（WCAG AA コントラスト検証込み）を docs/03 に反映
- [x] #15 セッティングカード UI 設計確定を docs/03 に反映
- [x] #16 OGP レイアウト（1200×630）確定を docs/03 に反映
- [x] #17 シェア動線・定型文確定を docs/03 に反映
- [x] CLAUDE.md の技術スタック欄を確定内容で更新
- [x] ドラフト PR 作成（https://github.com/ryoohshima/DartsSpec/pull/57）

### PR2 `feature/foundation`（base: develop）
- [x] #19 TanStack Start + TS + Tailwind 初期セットアップ（`pnpm build` / `pnpm typecheck` 緑）
- [x] #20 wrangler.jsonc + @cloudflare/vite-plugin + D1 バインディング
- [x] #21 TanStack Query 導入と SSR loader 連携（router.tsx で ssr-query 統合）
- [x] #22 Drizzle スキーマ（parts / settings + better-auth 4 テーブル）+ マイグレーション適用
- [x] #23 better-auth 統合（登録→ログイン→Cookie セッションを API で実証。ハッシュ保存確認済み）
- [x] #10 #11 パーツモックデータ CSV（138 件・出典付き・レンジ検証済み・モックと明記）
- [x] #12 seed スクリプト（決定的 ID で冪等）
- [x] #24 ローカル D1 への seed 投入確認（barrel 72 / shaft 32 / flight 22 / tip 12）
- [x] ドラフト PR 作成（https://github.com/ryoohshima/DartsSpec/pull/58）

### PR3 `feature/core-features`（base: feature/foundation）
- [x] #26 getParts server function
- [x] #27 calcSpec 実装 + vitest ユニットテスト（欠損値・端数・チップ有無、15 テスト緑）
- [x] #28 セッティング作成画面（実ブラウザで検証: 選択→ 21.6g / 100.0mm リアルタイム更新）
- [x] #29 createSetting（サーバ側再計算を DB 値で確認: 21.61g / 100mm）
- [x] #30 マイページ（一覧・編集・削除・所有者認可。他人の編集ページで拒否表示を実証）
- [x] #31 公開ページ /s/{id}（非認証 curl で SSR 閲覧・存在しない ID は 404）
- [x] 非ログイン下書き → 登録 → 自動保存 → 公開ページの一気通貫を実ブラウザで実証
- [x] ドラフト PR 作成（https://github.com/ryoohshima/DartsSpec/pull/59）

### PR4 `feature/ogp-share-launch`（base: feature/core-features）
- [x] #33 workers-og 統合（WASM static import はローカル Workers ランタイムで PNG 生成を確認）
- [x] #35 日本語フォント: Google Fonts `text=` サブセットを実行時取得する方式に変更（全字形 base64 は 3MB gzip 制限に収まらないため。gzip 合計 1.33MB）
- [x] #34 OGP 画像生成 API（1200×630 PNG・日本語描画確認・存在しない id は 404・非公開は汎用 OGP）
- [x] #36 OGP メタタグ（og:title / description / image / url + summary_large_image を SSR HTML で確認）
- [x] #37 シェアボタン（X Web Intent 定型文・URL コピー。公開ページ / 作成完了 / マイページに配置）
- [x] #38 キャッシュ（2 回目 0.27s → 0.009s のヒットを確認・og:image ?v={updatedAt} で編集時破棄）
- [x] #48 利用規約・プライバシーポリシーページ + 登録フローから参照
- [x] #50 フッターに 利用規約 / プライバシー / GitHub Issues への問い合わせ導線
- [x] #43 ローカル検証（テスト緑・認可・非認証閲覧・モバイル 375px 崩れなし・機密の非コミット確認）
- [x] ドラフト PR 作成（https://github.com/ryoohshima/DartsSpec/pull/60）

### スキップ（人間の対応が必須）
- #40 #41 #42（本番 D1・ドメイン・デプロイ）/ #44（SNS 実機確認）/ #46 #47 #49（テスター・ローンチ投稿）

## レビュー

- 4 本のドラフト PR を作成: #57（docs 確定）→ #58（基盤 M1+M3）→ #59（コア M4）→ #60（OGP・シェア・規約 M5+α）。#58〜#60 はスタック PR（この順にマージする）
- 検証: vitest 15 件緑 / typecheck / build 緑。実ブラウザ E2E で「非ログイン作成 → 下書き → 登録 → 自動保存 → 公開ページ → OGP 画像」の一気通貫を確認
- 自動セキュリティレビュー指摘の Open Redirect を修正（詳細は lessons.md）
- パーツマスタ 138 件は Web 公称値ベースの開発用モック。実測確認はクローズドテスト（#46-#47）で実施する前提
- 残タスク（人間の対応）: 本番 D1 作成・シークレット登録（#40）、ドメイン取得（#41）、本番デプロイ（#42）、OGP の SNS 実機確認（#44）、テスター募集〜ローンチ投稿（#46 #47 #49）
