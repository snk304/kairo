# 04_api.md — API実装仕様

## 共通仕様

### ベースURL
```
http://localhost:8000/api
```

### 認証
```
Authorization: Bearer {token}
```

### レスポンス形式

成功（単体）
```json
{ "data": {}, "message": "success" }
```

成功（一覧）
```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

バリデーションエラー（422）
```json
{
  "message": "バリデーションエラー",
  "errors": { "email": ["メールアドレスは必須です"] }
}
```

| ステータスコード | 意味 |
|----------------|------|
| 200 | 成功 |
| 201 | 作成成功 |
| 204 | 削除成功 |
| 401 | 未認証 |
| 403 | 認可エラー |
| 404 | リソース不存在 |
| 422 | バリデーションエラー |
| 500 | サーバーエラー |

---

## 認証API

### POST /auth/register/jobseeker
- 認証：不要
- リクエスト：`{ email, password, password_confirmation }`
- バリデーション：email必須・ユニーク、password最低8文字
- 処理：usersレコード作成（role=jobseeker）→ メール認証リンク送信
- レスポンス：201

### POST /auth/register/company
- 認証：不要
- リクエスト：`{ email, password, password_confirmation }`
- 処理：usersレコード作成（role=company）→ メール認証リンク送信
- レスポンス：201

### POST /auth/login
- 認証：不要
- リクエスト：`{ email, password }`
- 処理：認証成功 → Sanctumトークン発行
- レスポンス：200 `{ data: { token, user: { id, email, role } } }`
- エラー：認証失敗時401

### POST /auth/logout
- 認証：必須
- 処理：現在のトークンを削除
- レスポンス：200

### GET /auth/me
- 認証：必須
- レスポンス：200 `{ data: { id, email, role, profile } }`
- profileはroleに応じてjobseeker_profilesまたはcompany_profilesを返す

### POST /auth/password/forgot
- リクエスト：`{ email }`
- 処理：パスワードリセットメール送信
- レスポンス：200（emailが存在しない場合も同じレスポンスを返す）

### POST /auth/password/reset
- リクエスト：`{ token, email, password, password_confirmation }`
- 処理：トークン検証 → パスワード更新
- レスポンス：200

---

## 求職者プロフィールAPI

### GET /jobseekers
- 認証：不要
- クエリ：`disability_type_id, job_category_id, prefecture_id, work_style, page, per_page`
- 処理：is_public=trueの求職者のみ返す
- レスポンス：200（一覧形式）

### GET /jobseekers/{id}
- 認証：不要
- 処理：
  - 未認証・求職者ログイン時：連絡先・履歴書URLを含まない
  - 企業ログイン時：連絡先・履歴書URLを含む
- レスポンス：200

### GET /jobseekers/me
- 認証：必須（jobseeker）
- レスポンス：200（全フィールド）

### POST /jobseekers/me
- 認証：必須（jobseeker）
- リクエスト：JobseekerProfileRequest参照
- 処理：プロフィール作成
- レスポンス：201

### PUT /jobseekers/me
- 認証：必須（jobseeker）
- リクエスト：JobseekerProfileRequest参照
- 処理：プロフィール更新
- レスポンス：200

### POST /jobseekers/me/resume
- 認証：必須（jobseeker）
- リクエスト：multipart/form-data `{ file: PDF, max:10MB }`
- 処理：storageに保存、resume_pathを更新
- レスポンス：200 `{ data: { resume_url } }`

### DELETE /jobseekers/me/resume
- 認証：必須（jobseeker）
- 処理：ファイル削除、resume_pathをnullに更新
- レスポンス：204

---

## 企業プロフィールAPI

### GET /companies/{id}
- 認証：不要
- レスポンス：200（企業情報 + 公開中の求人一覧）

### GET /companies/me
- 認証：必須（company）
- レスポンス：200（全フィールド）

### POST /companies/me
- 認証：必須（company）
- リクエスト：CompanyProfileRequest参照
- レスポンス：201

### PUT /companies/me
- 認証：必須（company）
- レスポンス：200

### POST /companies/me/photos
- 認証：必須（company）
- リクエスト：multipart/form-data `{ file: JPEG/PNG, max:5MB }`
- レスポンス：201 `{ data: { id, url } }`

### DELETE /companies/me/photos/{id}
- 認証：必須（company）
- 処理：自社の写真のみ削除可能（Policyで制御）
- レスポンス：204

---

## 求人API

### GET /jobs
- 認証：不要
- クエリ：`job_category_id, prefecture_id, employment_type, work_style, keyword, page, per_page`
- 処理：status=publishedのみ返す。keywordはMeilisearchで全文検索
- レスポンス：200（一覧形式）

### GET /jobs/{id}
- 認証：不要
- 処理：status=publishedのみ返す（下書き・終了は404）
- レスポンス：200

### GET /jobs/me
- 認証：必須（company）
- クエリ：`status, page`
- 処理：自社の求人のみ返す（全ステータス）
- レスポンス：200（一覧形式 + application_count）

### POST /jobs
- 認証：必須（company）
- Policy：JobPolicy@create
- リクエスト：JobRequest参照
- レスポンス：201

### PUT /jobs/{id}
- 認証：必須（company）
- Policy：JobPolicy@update（自社求人のみ）
- レスポンス：200

### DELETE /jobs/{id}
- 認証：必須（company）
- Policy：JobPolicy@delete（自社求人のみ）
- レスポンス：204

### PUT /jobs/{id}/status
- 認証：必須（company）
- Policy：JobPolicy@update
- リクエスト：`{ status: draft|published|closed }`
- レスポンス：200

---

## 応募API

### POST /jobs/{id}/apply
- 認証：必須（jobseeker）
- Policy：ApplicationPolicy@create
- 処理：
  1. 二重応募チェック（すでに応募済みの場合422）
  2. applicationsレコード作成
  3. threadsレコード作成（ThreadService@findOrCreateByApplication）
  4. 企業に通知送信（application_received）
- レスポンス：201

### GET /applications/me
- 認証：必須（jobseeker）
- レスポンス：200（job・company情報を含む）

### GET /jobs/{id}/applications
- 認証：必須（company）
- 処理：自社求人のみ（Policyで制御）
- レスポンス：200

### GET /applications/{id}
- 認証：必須
- 処理：求職者は自分の応募のみ、企業は自社求人への応募のみ閲覧可
- レスポンス：200

### PUT /applications/{id}/status
- 認証：必須（company）
- Policy：ApplicationPolicy@updateStatus
- リクエスト：`{ status: applied|screening|interview|offered|rejected }`
- 処理：ステータス更新 → 求職者に通知（application_status_changed）
- レスポンス：200

---

## スカウトAPI

### POST /scouts
- 認証：必須（company）
- Policy：ScoutPolicy@create
- リクエスト：`{ jobseeker_id, job_id(任意), message }`
- 処理：
  1. scoutsレコード作成
  2. 求職者に通知（scout_received）
- レスポンス：201

### GET /scouts/received
- 認証：必須（jobseeker）
- レスポンス：200（company・job情報を含む）

### GET /scouts/sent
- 認証：必須（company）
- レスポンス：200（jobseeker・job情報を含む）

### PUT /scouts/{id}/read
- 認証：必須（jobseeker）
- 処理：status を read に更新
- レスポンス：200

### PUT /scouts/{id}/reply
- 認証：必須（jobseeker）
- リクエスト：`{ message }`
- 処理：
  1. status を replied に更新
  2. ThreadService@findOrCreateByScout でスレッド作成
  3. 返信メッセージをスレッドに投稿
  4. 企業に通知（scout_replied）
- レスポンス：200

---

## メッセージAPI

### GET /threads
- 認証：必須
- 処理：自分が参加しているスレッド一覧を返す。最新メッセージ・未読数を含む
- レスポンス：200

### GET /threads/{id}
- 認証：必須
- 処理：自分が参加しているスレッドのみ閲覧可（それ以外は403）
- レスポンス：200（messages一覧を含む）

### POST /threads
- 認証：必須
- リクエスト：`{ opponent_id, scout_id(任意), application_id(任意) }`
- 処理：すでにスレッドが存在する場合は既存スレッドを返す
- レスポンス：201

### POST /threads/{id}/messages
- 認証：必須
- 処理：
  1. メッセージ保存
  2. 相手に通知（message_received）
- レスポンス：201

### PUT /threads/{id}/read
- 認証：必須
- 処理：そのスレッドの自分宛て未読メッセージを全て既読にする
- レスポンス：200

---

## 通知API

### GET /notifications
- 認証：必須
- クエリ：`page`
- レスポンス：200（read_at=nullが未読）

### PUT /notifications/{id}/read
- 認証：必須
- 処理：自分の通知のみ既読可（それ以外は403）
- レスポンス：200

### PUT /notifications/read-all
- 認証：必須
- 処理：自分の全未読通知を既読にする
- レスポンス：200

---

## お問い合わせAPI

### POST /contacts
- 認証：不要
- リクエスト：`{ name, email, body }`
- バリデーション：name・email・body全て必須
- レスポンス：201

---

## 管理者API

### GET /admin/users
- 認証：必須（admin）
- クエリ：`role, page`
- レスポンス：200

### PUT /admin/users/{id}/suspend
- 認証：必須（admin）
- 処理：email_verified_atをnullに更新（ログイン不可にする）
- レスポンス：200

### DELETE /admin/users/{id}
- 認証：必須（admin）
- 処理：ソフトデリートは使わず物理削除
- レスポンス：204

### GET /admin/jobs
- 認証：必須（admin）
- 処理：全ステータスの求人を返す
- レスポンス：200

### PUT /admin/jobs/{id}/unpublish
- 認証：必須（admin）
- 処理：status を closed に更新
- レスポンス：200

### DELETE /admin/jobs/{id}
- 認証：必須（admin）
- レスポンス：204

### GET /admin/contacts
- 認証：必須（admin）
- レスポンス：200

### GET /admin/stats
- 認証：必須（admin）
- レスポンス：
```json
{
  "data": {
    "total_jobseekers": 500,
    "total_companies": 100,
    "total_jobs": 300,
    "total_applications": 1200,
    "total_scouts": 800,
    "total_messages": 5000
  }
}
```

---

## マスタAPI

### GET /master/disability-types
### GET /master/job-categories
### GET /master/prefectures

- 認証：不要
- レスポンス：`{ data: [ { id, name } ] }`
- キャッシュ：Redisに1時間キャッシュする
