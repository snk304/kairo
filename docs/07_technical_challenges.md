# 技術的難易度が高かったポイント・工夫したポイント

面接での説明用まとめ。実装中に実際に詰まった問題・解決策を中心に記載。

---

## 1. 認証（Laravel Sanctum × Next.js）

### なぜ難しいか

SanctumのCookieベース認証とNext.jsを繋ぐには、両側の設定を正確に合わせる必要がある。

- `SANCTUM_STATEFUL_DOMAINS` にNext.jsのドメインを登録
- `SESSION_DOMAIN` のクロスサブドメイン設定
- CORSで `Access-Control-Allow-Credentials: true` かつ `withCredentials: true`
- Next.jsのAPIクライアントに `axios.defaults.withCredentials = true` を設定

### 認証フロー

```
1. GET /sanctum/csrf-cookie  → CookieにCSRFトークンをセット
2. POST /api/auth/login      → セッションCookieを発行
3. 以降のリクエスト          → CookieとCSRFトークンを自動送信
```

設定が1つでもずれると無限に401が返り続ける。

### 面接での説明

> 「SPA認証ではCSRFトークンを `/sanctum/csrf-cookie` で取得してからログインする2ステップが必要で、CORSとCookieの設定をLaravelとNext.jsの両側で合わせないと無限に401が返ってくる点に苦労しました」

---

## 2. Server Component vs Client Component の境界（Next.js App Router）

### なぜ難しいか

Next.js 15のApp RouterはデフォルトでServer Component。
`onClick` などのイベントハンドラを書いた瞬間にビルドエラーになる。

### 実際に発生したエラー

`Footer.tsx` と `page.tsx` に `onMouseEnter` / `onMouseLeave` を書いていたため、ビルドが通らなかった。

**解決策**

- ホバー効果 → CSSクラス（`.hover-ink` / `.hover-forest`）に置き換え
- インタラクションが必要なコンポーネント → `'use client'` を追加

```typescript
// ❌ Server Componentでは使えない
<div onMouseEnter={() => ...}>

// ✅ CSSで代替
<div className="hover-forest">

// ✅ または先頭に追加
'use client'
```

### 設計の原則

| コンポーネント | 役割 |
|---|---|
| Server Component | データ取得・SEO・初期レンダリング |
| Client Component | イベントハンドラ・useState・アニメーション |

### 面接での説明

> 「App RouterではServer ComponentとClient Componentの境界を意識した設計が必要で、イベントハンドラはClient Componentにしか書けない。データ取得はServer Component、インタラクションはClient Componentに分ける設計判断をしました」

---

## 3. Profile ID vs User ID 問題（APIの型整合性）

### なぜ難しいか

UserテーブルとProfileテーブルが分離している設計では、どのIDを返すかを統一しないとAPIが壊れる。

```
users (id: ULID)
  ├── jobseeker_profiles (id: ULID, user_id: FK)
  └── company_profiles   (id: ULID, user_id: FK)
```

スレッド作成APIは `opponent_id` として `users.id` を要求するのに、
`ScoutResource` と `ThreadResource` がプロフィールのIDを返していた。
フロントから送ると422エラーになり、原因の特定に時間がかかった。

### 解決策

API Resourceに `userId` フィールドを明示的に追加。

```php
// ScoutResource.php
'jobseeker' => [
    'id'        => $this->jobseeker->jobseekerProfile->id,  // プロフィールID
    'userId'    => $this->jobseeker->id,                    // ユーザーID ← 追加
    'firstName' => $this->jobseeker->jobseekerProfile->first_name,
],
```

### 面接での説明

> 「UserとProfileを分離した設計ではAPIレスポンスでどのIDを返すかを一貫させる必要があります。今回はResourceクラスで `userId` フィールドを明示的に追加することで解決しました」

---

## 4. 3ロールの認可設計（Policy × Middleware × Resource）

### なぜ難しいか

求職者・企業・管理者で表示内容とできる操作が全く異なり、認可ロジックが複雑になりやすい。

| ルール | 実装箇所 |
|---|---|
| 求職者のメール・履歴書は企業のみ閲覧可 | API Resource |
| 企業は自社求人のみ編集可 | Policy |
| スレッドは参加者のみ閲覧可 | Policy |
| 管理者APIへのアクセス制限 | Middleware |

### 実装例

**API Resourceでフィールドを条件分岐**

```php
// JobseekerProfileResource.php
$isCompany = $request->user()?->isCompany();

return [
    'id'        => $this->id,
    'firstName' => $this->first_name,
    // 企業ログイン時のみ含める
    'email'     => $this->when($isCompany, $this->user->email),
    'resumeUrl' => $this->when($isCompany, $this->resolveResumeUrl()),
];
```

**Policyで所有者チェック**

```php
// JobPolicy.php
public function update(User $user, Job $job): bool
{
    return $user->companyProfile?->id === $job->company_id;
}
```

### 面接での説明

> 「認可ロジックをControllerに書くとFat Controllerになるので、リソースのアクセス制御はPolicyクラスに、レスポンスのフィールド制御はAPI Resourceクラスに分離しました」

---

## 5. スレッド・メッセージの自動生成ロジック

### なぜ難しいか

「応募するとスレッドが自動生成される」仕様では、**冪等性**の保証が必要。
2回応募してもスレッドが2つ作られないようにしなければならない。

### 実装

```php
// ThreadService.php
public function findOrCreateByApplication(Application $application): Thread
{
    return Thread::firstOrCreate([
        'jobseeker_id' => $application->jobseeker_id,
        'company_id'   => $application->job->company_id,
    ]);
}
```

`firstOrCreate` を使い、同じ組み合わせのスレッドが既存なら取得、なければ作成。

### もう一つの問題：`create()` 後にDBデフォルト値が反映されない

`Message` モデルは `$timestamps = false` にしていたが、DBカラムには `useCurrent()` でデフォルト値を設定していた。
`Message::create()` 直後のモデルインスタンスには `created_at` と `is_read` が入っていない。

```php
// ❌ created_at が null になる
$message = Message::create([...]);

// ✅ DBから再取得して正しい値を返す
$message = Message::create([...])->refresh();
```

### 面接での説明

> 「Eloquentでは `create()` 後のモデルインスタンスはDBのデフォルト値を持たないため、タイムスタンプを無効にしているモデルでは `->refresh()` を呼んでDBから再取得する必要がありました」

---

## 6. Tailwind CSS v4 の `@import` 順序問題

### なぜ難しいか

Tailwind v4は `@import "tailwindcss"` をビルド時にインライン展開する。
CSSの仕様では `@import` はファイルの先頭に書かなければならないため、
Google Fontsの `@import url(...)` を後に書くとエラーになる。

```css
/* ❌ ビルドエラー：@import は先頭に書く必要がある */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/...');

/* ✅ 正しい順序 */
@import url('https://fonts.googleapis.com/...');
@import "tailwindcss";
```

### 面接での説明

> 「Tailwind v4の破壊的変更として `@import "tailwindcss"` がインライン展開されるため、外部フォントの読み込みより後に書くとCSS仕様違反になります。バージョンアップ時に起きやすい落とし穴です」

---

## 7. ULIDによる主キー設計

### なぜULIDを使ったか

このアプリでは全モデルのPKにULIDを採用している。

| | UUID | ULID | 連番ID |
|---|---|---|---|
| ソート可能 | ❌ | ✅（時刻順） | ✅ |
| URLに露出しても安全 | ✅ | ✅ | ❌（総数が推測される） |
| インデックス効率 | 低 | 中〜高 | 高 |

URLに `/jobs/1` と書くと件数が推測できるため、セキュリティ上ULIDが望ましい。

```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Job extends Model
{
    use HasUlids;
}
```

### 面接での説明

> 「連番IDだとURLから総件数が推測されるセキュリティリスクがあります。ULIDは時刻順にソート可能でインデックス効率もUUIDより良く、このアプリに適切な選択でした」

---

## まとめ（面接での一言）

> 「最も難しかったのは、**Laravel（API）とNext.js（SPA）間の認証・型整合性の担保**です。SanctumのCookie認証、API ResourceでのID設計、Server/Client Componentの境界設計を組み合わせて、セキュアかつ型安全なフルスタック構成を実現しました。また、認可ロジックをPolicy・Resource・Middlewareの3層に分離することで、Fat Controllerを避けつつ複雑なロール制御を実現しています」
