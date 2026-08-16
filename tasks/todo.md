# #89 パーツマスタ seed の実データ収集（2026-08-16）

ブランチ: `feature/seed-parts-real-data`（base: develop）
方針: 公式スペックページを出典（source_url）に、issue #89 の着手順でブランドごとに 1 コミットずつ積む。検証済み分だけ PR に載せる。

## Todo

- [x] CONDOR: 一体型 2 行規約で shaft/flight 対を登録（AXE 3 形状 11 対）+ TIP 公式化 + ULTIMATE 追加
- [x] `pnpm db:seed` → 実 UI で flight⇔shaft の連動を双方向確認（Wing Slim M / Standard S で双方向 OK）
- [x] JOKER DRIVER: バレル 4 種追加（CRYSTAL VALKYRIE / HALCYON、DRASTIC IZZY / DEATH CUBE）
- [x] MONSTER: バレル 2 種追加（OGRE Ⅶ / GUNNER Ⅴ）。tip は公式製品を確認できず見送り
- [x] TIGA: バレル 4 種追加（LOCHE2 / LUMINOUS3 / UNRAVEL / HERMIT2）
- [x] 検証: db:seed（169 件）/ typecheck / vitest 25 passed / UI でバレル一覧表示確認
- [x] コミット分割（ブランドごと 4 コミット）+ develop 宛 draft PR

## Review

- CONDOR AXE は Standard/Small（S/M/L/XL）+ Wing Slim（S/M/L、XL なし）の 11 対を 2 行規約で登録。UI で flight⇔shaft の双方向連動を実機確認済み
- shaft 行の重量 1.6g は公式計測値（Small L・1 本）の代表値補完。サイズ別実測は公式未公表のため #11 の品質チェック対象
- 出典はすべてメーカー公式（TiTO 直営 / JOKERDIRECT / MONSTER 公式 / TIGA 公式）。公式で数値が確認できないモデル（CRYSTAL INSPIRE、THE KING、KITTEN Ⅲ、CIVIL、MONSTER チップ）は登録を見送り
- 旧 CONDOR 行（dartshive 出典・weight 空欄）は ID 変化により再 seed で自動 is_active=0 化

## メモ

- seed.ts は全 seed 行を is_active=0 にしてから upsert するため、改名（ID 変化）した旧行は自動無効化される
- flight 行は weight_g=0（空欄は参考値表示になる）、実測値は shaft 行に持たせる
- 公式にスペック表が無い値は代表値補完せず、その行を見送る
