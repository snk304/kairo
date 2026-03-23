# security.md — 認可・セキュリティルール

## 絶対に守る認可ルール

### 求職者の個人情報保護

```
連絡先（email）と履歴書URL は企業ログイン時のみレスポンスに含める
未認証・求職者ログイン時は含めない
```

JobseekerProfileResourceで必ず条件分岐すること。

```php
// ✅ 正しい実装
$isCompany = $request->user()?->isCompany();
'email'      => $this->when($isCompany, $this->user->email),
'resume_url' => $this->when($isCompany, $this->resolveResumeUrl()),
```

### リソースの所有者チェック

```
企業は自社の求人のみ 編集・削除・ステータス変更できる
企業は自社求人への応募のみ ステータス変更できる
ユーザーは自分のスレッドのみ 閲覧・投稿できる
ユーザーは自分の通知のみ 既読にできる
```

これらは必ずPolicyクラスに実装し、コントローラーで `$this->authorize()` を呼ぶ。

### ロール制限

```
求職者のみ：プロフィール作成・求人応募・スカウト受信
企業のみ：求人作成・求職者検索・スカウト送信・応募者管理
管理者のみ：ユーザー管理・求人強制非公開・統計閲覧
```

管理者APIは `middleware('role:admin')` で必ずガードする。

---

## セキュリティ設定

- パスワードは `bcrypt` でハッシュ化（Laravelデフォルト）
- APIは全てSanctumトークン認証
- ファイルアップロードはPDFと画像のみ許可、MIMEタイプを必ず検証する
- S3の署名付きURLは30分で失効させる
- CORS設定で `allowed_origins` を `localhost:3000` に限定する（本番は適切なドメインに変更）
