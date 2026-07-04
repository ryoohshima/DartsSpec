# GitHub ワークフロー点検・改善

計画: `~/.claude/plans/github-workflow-wondrous-ripple.md`

## TODO

- [x] `ci.yml.example` の action バージョン更新（checkout v7 / setup-node v6 / pnpm-action-setup v6）
- [x] `claude-code-review.yml` に draft・dependabot スキップの `if:` と concurrency を追加
- [ ] リポジトリ設定 `can_approve_pull_request_reviews` を true に変更（要手動実行・下記参照）
- [x] YAML 構文検証（全 4 ワークフロー OK）
- [x] `ci:` プレフィックスでコミット

## レビュー

- `ci.yml.example`: 3 ジョブすべてで checkout v4→v7 / pnpm-action-setup v4→v6 / setup-node v4→v6 に更新。dependabot は `.example` を更新しないため手動更新が必要だった。
- `claude-code-review.yml`: draft PR と dependabot PR をスキップする `if:` と、同一 PR 連続 push 時に古い実行をキャンセルする concurrency を追加。Claude 使用量の浪費を防止。
- claude.yml / stale.yml / dependabot.yml / release.yml は点検の結果問題なし（変更不要）。
- secret `CLAUDE_CODE_OAUTH_TOKEN` は設定済みを確認。
- **未完了**: リポジトリ設定変更はセキュリティ上の権限で自動実行できず。以下をユーザーが手動実行する必要あり:

  ```sh
  gh api -X PUT repos/ryoohshima/DartsSpec/actions/permissions/workflow \
    -f default_workflow_permissions=read \
    -F can_approve_pull_request_reviews=true
  ```

- 範囲外の残課題: README / CODEOWNERS / CLAUDE.md にテンプレート残骸（`github-template` 表記など）が残っている。
