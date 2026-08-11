# design.pen 更新のコード反映（2026-08-11）

design.pen 側の更新（保存ゲート / 検索モーダル / モバイルタブ / LP 統合ほか）を src/ へ反映する。
ブランチ: `feature/design-sync-ui`（base: develop）

## Todo

- [x] Header: CTA 文言「はじめる」→「登録」（ログイン時表示は実装済みのため文言のみ）
- [x] SaveGateModal 新規作成 + new.tsx で未ログイン保存時にモーダル表示（下書き保存→登録/ログインへ redirect 付き遷移）
- [x] PartsSelector をプルダウン→検索モーダル方式に置換（キーワード絞り込み・チェック表示・未選択行・インライン SVG アイコン）
- [x] SettingForm にモバイル専用セグメントタブ（入力/プレビュー）を追加（両列マウント維持・CSS 切替、edit 画面は共有フォーム経由で自動対応）
- [x] LP: InteractiveDemo を削除し SHARE CARD ショーケース（静的 SettingCard 2 枚）へ置換
- [x] 検証: vitest（18 passed）/ typecheck / build / ブラウザ実機確認（モバイル 375px・デスクトップ 1280px）
- [x] コミット分割 + develop 宛 draft PR

## コード変更なしと判断した項目

- ログイン時ヘッダー（ZppQt）: セッション分岐は実装済み
- 品質修正（enabled:false の警告）・配置整理: design.pen 内のみの変更
- 利用規約・プライバシー: routes/terms.tsx・privacy.tsx と Footer リンクが既存

## Review

- デザインの glass 系 hex は既存トークン（bg-surface / border-line / bg-accent）へ写像。アイコンはライブラリ未導入のためインライン SVG（search / x / check / lock）で対応
- 検索モーダルはカナ検索に対応（BRAND_KANA 別名マップ + ひらがな→カタカナ正規化）。デザインのデモ「コスモ」→ COSMO DARTS を実機で確認済み
- モバイルのプレビュータブ表示中は保存ボタンごとフォーム列を非表示（design の vQEXf と同挙動）。両列は常時マウントで状態を維持
- 保存ゲートは下書きを localStorage 保存してからモーダル表示。登録/ログインの両リンクに `redirect=/settings/new?resume=1` を付与し、既存の復帰自動保存フローへ接続
- **未了**: `src/components/InteractiveDemo.tsx`・`src/lib/curateDemoParts.ts`・`tests/curateDemoParts.test.ts` の削除がパーミッションで拒否されたため残置（参照は全て除去済みでビルドに影響なし）。手動削除が必要
