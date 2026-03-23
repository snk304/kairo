# git.md — Git運用ルール

## ブランチ構成

```
main        # 本番リリース用
develop     # 開発の統合ブランチ
feature/*   # 機能開発（develop から分岐）
fix/*       # バグ修正
```

## ブランチ命名

```
feature/add-scout-api
feature/job-list-page
fix/application-duplicate-check
```

## コミットメッセージ

```
feat: スカウト送信APIを追加
fix: 二重応募チェックのバグを修正
chore: Docker設定を更新
test: 応募APIのテストを追加
docs: API仕様書を更新
```

## 必ず守ること

- `.env` は絶対にコミットしない
- `main` への直接pushは禁止
- 1コミット = 1つの目的
