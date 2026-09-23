# #43 リリース前チェックリスト実施（2026-08-19）

- [x] 合算ロジックのユニットテスト緑（vitest 25 passed）
- [x] 認可: 別アカウントで他人の編集 URL → 権限エラーを実証 + サーバ関数の canModifySetting をコード確認
- [x] 公開ページの非ログイン閲覧（curl 200、#42 で実証）
- [x] シークレット未コミット（tracked は .example のみ / ハードコードなし / git 全履歴クリーン）
- [x] モバイル表示: 375px エミュレーションで トップ / 公開ページ / 作成フォーム / 検索モーダル 崩れなし
- [ ] モバイル実機確認（ユーザーのスマホで一巡）→ 完了次第 #43 クローズ

結果は #43 にコメント済み（issuecomment-5342299562）。

---

# #42 本番マイグレーション・seed 投入・デプロイ（2026-08-19）

対象: 本番環境（darts-spec.com / D1 dartsspec）。リリースは Release ワークフロー（PR #92 整備）一発で実行。

## Todo

- [x] 事前検証: develop HEAD で typecheck / vitest 25 passed / build 成功
- [x] Release ワークフロー発火（v0.1.0）: develop→main マージ → タグ → Release → 本番マイグレーション → デプロイ（run 32228165659、全工程成功）
- [x] Seed ワークフロー発火（--ref main）: run 32228402410 成功
- [x] seed 検証: 本番 D1 で有効 189 件、新 5 ブランド確認（DMC 5 / Samurai 2 / ULTIMA 4 / One80 4 / D.craft 3）
- [x] スモークテスト（非認証分）: トップ 200 / 公開ページ /s/{id} 200・OGP メタ SSR 出力 / OGP 画像 200 image/png
- [x] 発見バグ修正: og:url / og:image が相対 URL（VITE_SITE_URL 未設定）→ PR #104 で deploy.yml 修正（README ドメイン追記含む）→ v0.1.1 再リリース（run 32229275928）で絶対 URL を確認
- [x] 追加応急修正（ユーザー依頼）: 背景 Darts Mark の広画面ずれ + 問い合わせ導線を contact@darts-spec.com へ → PR #105 → v0.1.2 リリース（run 32250474426）で反映確認
- [x] スモークテスト（認証分）: メール / パスワード登録 → 作成（新ブランド ULTIMA・カナ検索「あるてぃま」・CONDOR 連動選択・合算 18.4g/88.5mm）→ 保存・公開 → 非認証閲覧 200・OGP 画像描画確認 → 削除で 404
- [x] #42 に結果をコメントしてクローズ

## Review

- v0.1.0 → v0.1.2 の 3 リリースで完了。初タグ・初 GitHub Release を作成し、Release ワークフロー（マージ→タグ→Release→マイグレーション→デプロイ）が実運用で機能することを確認
- スモークテストで OGP 相対 URL バグを検出（VITE_SITE_URL が CI ビルドに未設定）。build-time 変数は Workers のシークレットでは注入できないため deploy.yml に直接記載（PR #104）
- 認証スモークは Google ログイン不可の自動化ブラウザ制約を、本番でも有効な emailAndPassword 認証で回避。テストセッティングは削除済み（公開 URL 404 を確認）。テストアカウント smoke-test-20260819@example.com は残存（UI に退会機能なし）
- 軽微な既知事項: OGP 画像でローマ数字「Ⅵ」が「VI」と描画される（フォントサブセットの字形差、判読可）。SNS 実機カード確認は #44 で実施
