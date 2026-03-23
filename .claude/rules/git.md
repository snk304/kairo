# git.md — Git運用ルール

## チーム構成

| 役割 | 担当 |
|------|------|
| PM | 要件定義・PRレビュー（機能要件の確認）・develop→mainマージ |
| バックエンドエンジニア | `backend/` 実装・APIアノテーション更新 |
| フロントエンドエンジニア | `frontend/` 実装・型エラー確認 |

---

## ブランチ構成

```
main        # 本番リリース用（直接pushは禁止）
develop     # 統合・ステージング（直接pushは禁止）
feature/back-*   # バックエンドの機能開発（develop から分岐）
feature/front-*  # フロントエンドの機能開発（develop から分岐）
fix/*            # バグ修正
```

---

## 日常の開発フロー

```bash
# 1. develop を最新にしてブランチを切る
git checkout develop && git pull origin develop
git checkout -b feature/back-application-api   # or feature/front-job-list

# 2. 実装・コミット（1コミット = 1つの目的）

# 3. develop に PR を出す
#    → PRテンプレートに従ってレビュアーをアサイン

# 4. レビュー・CI通過後にマージ

# 5. リリース時: PM が develop → main の PR を出してマージ
```

---

## PRのレビュー担当

| PRの内容 | 必須レビュアー |
|----------|--------------|
| バックエンドのみ変更 | フロントエンジニア（APIが壊れてないか）＋ PM |
| フロントエンドのみ変更 | バックエンジニア ＋ PM |
| **API仕様の変更あり** | **両エンジニア必須** ＋ PM |

### API仕様変更時の並行開発ルール

```
1. バックが先にアノテーション追加 → openapi.json更新のPRをdevelopに出す
2. PMとフロントが仕様レビュー（実装前に合意）
3. 合意後にバックが実装・フロントはモックで先行開発
4. バックマージ → CI が openapi.json 自動更新 → フロントの型が再生成
5. フロントが型エラーを確認して微調整
```

---

## ブランチ保護ルール

**develop ブランチ**
- PRは1名以上の承認が必須
- CI（Backend / Frontend）の通過が必須
- 直接pushは禁止

**main ブランチ**
- PRは1名以上の承認が必須
- CI通過が必須
- `develop` からのマージのみ（原則として直接featureブランチからはマージしない）
- 直接pushは禁止

---

## ブランチ命名

```
feature/back-application-api
feature/back-scout-notification
feature/front-job-list-page
feature/front-application-form
fix/back-duplicate-application-check
fix/front-profile-form-validation
```

---

## コミットメッセージ

```
feat: スカウト送信APIを追加
fix: 二重応募チェックのバグを修正
chore: Docker設定を更新
test: 応募APIのテストを追加
docs: API仕様書を更新
refactor: ApplicationServiceをリファクタリング
```

---

## 必ず守ること

- `.env` は絶対にコミットしない
- `main` / `develop` への直接pushは禁止
- 1コミット = 1つの目的
- API変更時は必ず `openapi.json` を更新してからPRを出す
