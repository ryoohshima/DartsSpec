# 02. パーツデータ設計

対応ステップ: **Step 2 — 初期パーツデータの収集と準備**

ユーザーがアクセスした際に「自分の使っているパーツがない」とがっかりして離脱するのを防ぐため、主要なデータだけを事前に準備する。**データの網羅性が初期の離脱率を左右する**ため、本ドキュメントの精度がサービスの土台になる。

## 1. 対象ブランドの選定

国内で圧倒的なシェアを持つ主要ブランドに絞る。全網羅を狙わず、まず「定番」を押さえる。

| ブランド | 主な強み | 優先度 |
|---|---|---|
| **TRiNiDAD（トリニダード）** | 国内トップシェアのバレル | 最優先 |
| **TARGET（ターゲット）** | 海外大手・プロ使用多数 | 最優先 |
| **COSMO DARTS（コスモダーツ）** | Fit Flight・バレル（DARTSLIVE 系） | 最優先 |
| **L-style（エルスタイル）** | シャフト・フライトの定番（Lフライト） | 最優先 |
| **Fit Flight（フィットフライト）** | フライトのデファクト規格 | 最優先 |
| DYNASTY / A-flow | 人気バレルブランド | 次点 |
| Harrows / unicorn | 海外定番 | 次点 |

> フライト・シャフトは「Fit Flight 規格」「L-style 規格」といった**規格の互換性**が存在する。将来的に互換フィルタを設ける余地を残し、スキーマに `standard`（規格）フィールドを持たせておく。

## 2. データ収集方針

- 各ブランドの**公式サイト**や大手 EC サイトから、主要パーツの「製品名」「重量」「全長」等を集める。
- まずは手動でスプレッドシート等に、主要・定番パーツを **100〜200 件**リストアップする。
- このスプレッドシートがそのまま初期データベースの**マスタデータ（seed）**になる。

### 収集時の注意

- **一次ソースを優先**する。公式スペックと EC 表記が食い違う場合は公式を採用。
- 重量は同一バレルでも複数展開（例: 18g / 20g）がある。**型番違いは別レコード**として登録する。
- 単位を統一する（重量: グラム `g` / 長さ: ミリメートル `mm`）。
- 著作権・商標に配慮し、**スペック数値と製品名（事実情報）のみ**を扱う。公式画像の無断転載はしない。

## 3. マスタデータのスキーマ（初期案）

パーツ種別ごとにテーブルを分けず、共通の `parts` テーブルに `category` で種別を持たせる**単一テーブル方式**を初期採用する（種別ごとにスペック項目が異なる分は nullable + `spec`(JSON) で吸収）。実装詳細は [04. アーキテクチャ](./04-architecture.md) を参照。

### 共通フィールド

| フィールド | 型 | 説明 | 例 |
|---|---|---|---|
| `id` | UUID | 主キー | `...` |
| `category` | enum | `barrel` / `shaft` / `flight` / `tip` | `barrel` |
| `brand` | string | ブランド名 | `TRiNiDAD` |
| `series` | string? | シリーズ名 | `PRO` |
| `name` | string | 製品名 | `Gomez Type 12` |
| `standard` | string? | 互換規格 | `Fit Flight` / `L-style` |
| `spec` | JSON | 種別固有スペック（下記） | `{...}` |
| `image_url` | string? | 画像 URL（任意・権利に配慮） | `null` |
| `is_active` | boolean | 表示可否 | `true` |
| `created_at` | timestamp | 登録日時 | |

> ここでの型は**論理型**である。物理的には Cloudflare D1（SQLite）に格納するため、`UUID`→`TEXT`、`enum`→`TEXT`、`JSON`→`TEXT`(JSON 文字列)、`boolean`→`INTEGER`、`timestamp`→`INTEGER`(epoch) にマップされる。詳細は [04. アーキテクチャ §3](./04-architecture.md) を参照。`spec` は Drizzle の `text({ mode: 'json' })` でアプリ層は型付きに扱える。

### 種別固有スペック（`spec` の中身）

**バレル (barrel)**
| キー | 型 | 説明 |
|---|---|---|
| `weight_g` | number | 重量（g）※チップ・フライト等を除いた本体 |
| `length_mm` | number | 全長（mm） |
| `max_diameter_mm` | number? | 最大径（mm） |
| `material` | string? | 素材（例: タングステン 90%） |

**シャフト (shaft)**
| キー | 型 | 説明 |
|---|---|---|
| `length_mm` | number | 長さ（mm） |
| `weight_g` | number? | 重量（g） |
| `material` | string? | 素材（樹脂 / カーボン / アルミ 等） |

**フライト (flight)**
| キー | 型 | 説明 |
|---|---|---|
| `shape` | string | 形状（スタンダード / シェイプ / ティアドロップ 等） |
| `thickness` | string? | 厚み（例: 100μ） |
| `weight_g` | number? | 重量（g） |

**チップ (tip)**
| キー | 型 | 説明 |
|---|---|---|
| `type` | string | ソフト / ハード |
| `length_mm` | number? | 長さ（mm） |
| `weight_g` | number? | 重量（g） |

## 4. スペック自動合算ロジック

[01. PRD](./01-product-requirements.md) のコア機能。選択されたパーツから、以下を算出する。

```
総重量 (total_weight_g)
  = barrel.weight_g
  + (shaft.weight_g ?? 0)
  + (flight.weight_g ?? 0)
  + (tip.weight_g ?? 0)

セッティング全長 (total_length_mm)
  = barrel.length_mm
  + shaft.length_mm
  + (tip.length_mm ?? 0)
  # ※フライトは全長に含めない（バレル後端に装着する羽根のため）
```

### 実装上の注意

- **欠損値の扱い**: シャフト/フライト/チップの重量は未登録レコードもあり得る。`?? 0` でフォールバックしつつ、UI では「一部スペック未登録のため参考値」と注記する。
- **バレル単体重量 vs セット重量**: メーカー表記が「セット重量」の場合があるため、収集時に**バレル本体重量**か**完成重量**かを明記する。合算ロジックはバレル本体重量を前提とする。
- 合算は**フロント側でリアルタイム計算**し、保存時にサーバ側でも再計算して検証する（改ざん防止・整合性担保）。

## 5. seed データの管理

| 項目 | 方針 |
|---|---|
| 原本 | スプレッドシート（Google Sheets 等）で管理 |
| 取り込み | CSV エクスポート → seed スクリプト（Drizzle）で D1 へ投入 |
| 配置 | `src/db/seed.ts` ＋ `src/db/seed/parts.csv`（実装時に確定） |
| 実行 | ローカル: `pnpm db:seed` / 本番: `wrangler d1 execute` 経由 |
| 更新運用 | ブランド追加・新製品は原本を更新し、差分を再投入 |

### CSV カラム例

```csv
category,brand,series,name,standard,weight_g,length_mm,max_diameter_mm,material
barrel,TRiNiDAD,PRO,Gomez Type 12,,18.0,45.0,7.2,タングステン90%
shaft,L-style,L-SHaft Carbon,190 Silent,L-style,,19.0,,カーボン
flight,Fit Flight,Standard,Standard,Fit Flight,,,,
tip,COSMO DARTS,Fit Point,Fit Point PLUS,Fit Flight,,,,ソフト
```

## 6. データ品質のチェックリスト

- [ ] 主要 5 ブランドの定番バレルを各 10〜20 件以上収録したか
- [ ] 重量・全長の単位が統一されているか（g / mm）
- [ ] 同一製品の重量違いを別レコードにしたか
- [ ] 数値の桁・小数点ミスがないか（合算ロジックが破綻しないか）
- [ ] 商標・画像の権利に配慮しているか
