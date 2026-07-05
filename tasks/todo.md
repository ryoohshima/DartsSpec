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
- [ ] ドラフト PR 作成

### PR3 `feature/core-features`（base: feature/foundation）
- [ ] #26 getParts server function
- [ ] #27 calcSpec 実装 + vitest ユニットテスト（欠損値・端数・チップ有無）
- [ ] #28 セッティング作成画面（リアルタイム合算・アニメーション・非ログイン下書き）
- [ ] #29 createSetting（サーバ側再計算・認証必須）
- [ ] #30 マイページ（一覧・編集・削除・所有者認可 + 認可テスト）
- [ ] #31 公開ページ /s/{id}（SSR・非認証閲覧）
- [ ] ドラフト PR 作成

### PR4 `feature/ogp-share-launch`（base: feature/core-features）
- [ ] #33 workers-og 統合と WASM バンドル設定
- [ ] #35 日本語フォントのサブセット化と base64 埋め込み
- [ ] #34 OGP 画像生成 API（GET /api/og/{id}・404 対応）
- [ ] #36 OGP メタタグ（summary_large_image）
- [ ] #37 シェアボタン（X Web Intent・URL コピー）
- [ ] #38 OGP キャッシュ制御（Cache-Control・?v= 破棄）
- [ ] #48 利用規約・プライバシーポリシーページ
- [ ] #50 問い合わせ導線（フッター → GitHub Issues）
- [ ] #43 ローカルで可能な検証（テスト緑・認可・非認証閲覧・シークレット非コミット）
- [ ] ドラフト PR 作成

### スキップ（人間の対応が必須）
- #40 #41 #42（本番 D1・ドメイン・デプロイ）/ #44（SNS 実機確認）/ #46 #47 #49（テスター・ローンチ投稿）

## レビュー

（完了時に記載）
