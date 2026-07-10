# design.pen 全画面書き起こし

対象ファイル: `/Users/ryoohshima/gitfiles/private/DartsSpec/design.pen`（エディタで開かれている既存ファイルに追記。worktree 側に新規作成しない）

計画: `~/.claude/plans/desigin-pen-iterative-glade.md`（承認済み。前提のみ変更: 新規作成 → 既存ファイル拡張。変数 9 色・SettingCard・Pill・LP 案は既存）

## Todo

- [x] セットアップ: スキーマ取得・既存ノード把握
- [x] コンポーネント: Button Primary / Button Outline / Text Field / Select Field
- [x] コンポーネント: Header（guest/authed を enabled 切替で 1 本化）・Footer
- [x] コンポーネント: SettingCard（Title Row + 作者名を追加、パーツ行を折返し対応に改良）
- [x] コンポーネント: Share Buttons（normal。prominent は作成完了状態がスコープ外のため不要と判断）
- [x] 画面 02 Sign In（Mobile 375 / Desktop 1280）
- [x] 画面 03 Sign Up（Mobile / Desktop）
- [x] 画面 01 Landing（Mobile / Desktop）※既存 LP 案（1440px）は無傷で保持
- [x] 画面 07 Public /s/$id（Mobile / Desktop）
- [x] 画面 04 My Page（Mobile / Desktop、公開+非公開カード）
- [x] 画面 05 New（Mobile / Desktop、チップ未選択+参考値表示）
- [x] 画面 06 Edit（Mobile / Desktop、全パーツ選択）
- [x] 全 14 フレーム + 既存 LP を export_nodes で視覚 QA（モバイル 4 件の崩れを修正済み）

## Review

- 7 画面 × Mobile(375)/Desktop(1280) = 14 フレームを design.pen に追加。実装ソース（src/routes/ / src/components/）の文言・レイアウトを忠実に転記
- 再利用コンポーネント 7 種（Button×2 / Field×2 / Header / Footer / ShareButtons）+ 既存 SettingCard 拡張。画面は全てインスタンス参照（detach なし）で構築し、変数（$color-*）のみで着色
- QA で検出し修正した崩れ: モバイルヘッダーのナビあふれ / 公開ページのタイトルと作者名の重なり / SHAFT 製品名のはみ出し（マスターで折返し対応）/ New のリード文はみ出し / シャフトセレクト値あふれ（ellipsis 化）
- Pencil MCP の運用知見は `~/.claude/projects/.../memory/design_workflow_pencil_mcp.md` に追記
