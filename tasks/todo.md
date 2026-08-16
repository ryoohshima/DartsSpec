# #89 パーツマスタ seed の実データ収集・第 2 弾（2026-08-16）

ブランチ: `feature/seed-parts-remaining-brands`（base: develop）
前提: 第 1 弾（CONDOR / JOKER DRIVER / MONSTER / TIGA）は PR #100 でマージ済み。見送り分の再調査は #101。

## Todo

- [x] L-style: チップ拡充（Premium Lippoint 30 / Premium Lippoint No.5）
- [x] DMC: バレル 5 種（NO NAME 01 / Sabre Tetsuya_SP3 / Hawk Masaki_SP1.5 / Avenger 18g・20g）
- [x] Samurai: バレル 2 種（Samurai17 / Samurai1 改）。公式は旧 TLS で WebFetch 不可 → curl で直接確認
- [x] ULTIMA DARTS: バレル 4 種（KAISERⅥ GOLD / Rush BurnⅡ / RAGNAROK 18.5g / GLANZⅢ）
- [x] One80: バレル 4 種（GRIPTRON GT4 17.9g・20g / VAELKRIS V6 18g・20g、日本公式 one80dart.jp）
- [x] D.craft: バレル 3 種（GOBLET / DIEZ / ZONE BRASS mHz-2 RED）。DC チップ / PC シャフトは公式ページ不在で見送り
- [x] DYNASTY shaft・flight: 全見送り（シャフト単体製品なし、Dee.flight は数値スペック非公開）
- [x] カナ検索別名に新 5 ブランドを追加（計 16 ブランド）
- [x] 検証: db:seed（189 件）/ typecheck / vitest 25 passed / UI 表示・カナ検索（「あるてぃま」）確認
- [ ] develop 宛 draft PR + #101 へ見送り分の追記

## Review

- 調査はブランド別サブエージェント 4 班に並列オフロードし、報告値は必ず公式ページの直接取得で抜き打ち検証した。検証により「KAISER III → 実際は KAISERⅥ GOLD」の名称誤りを検出・修正。One80 は台湾サイト（規格・素材未記載）でなく日本公式（2BA・タングステン 90% 明記）の現行モデルを採用
- Samurai / DYNASTY 公式は旧 TLS 構成で WebFetch 不可。curl 直叩きで Samurai は取得成功（規格 2BA のみ小売表記で裏取り）
- 新規見送り: D.craft の DC チップ・PC シャフト（公式サイトに商品ページ無し）、DYNASTY の shaft（単体製品なし）・flight（Dee.flight は数値非公開）→ #101 に追記
