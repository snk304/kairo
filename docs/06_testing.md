# 06_testing.md — テスト仕様

## 概要

バックエンドはPestPHP、フロントエンドはJestでテストを実装する。
CIはGitHub Actionsで自動実行する。

---

## バックエンドテスト（PestPHP）

### セットアップ

```bash
composer require pestphp/pest --dev
composer require pestphp/pest-plugin-laravel --dev
./vendor/bin/pest --init
```

テスト用DBはPostgreSQLのテスト用データベースを使う。
`phpunit.xml` に以下を設定する。

```xml
<env name="DB_DATABASE" value="matching_db_test"/>
<env name="CACHE_STORE" value="array"/>
<env name="SESSION_DRIVER" value="array"/>
<env name="QUEUE_CONNECTION" value="sync"/>
```

### テストファイル構成

```
backend/tests/
├── Feature/
│   ├── Auth/
│   │   └── AuthTest.php
│   ├── JobseekerProfile/
│   │   └── JobseekerProfileTest.php
│   ├── CompanyProfile/
│   │   └── CompanyProfileTest.php
│   ├── Job/
│   │   └── JobTest.php
│   ├── Application/
│   │   └── ApplicationTest.php
│   ├── Scout/
│   │   └── ScoutTest.php
│   ├── Thread/
│   │   └── ThreadTest.php
│   └── Admin/
│       └── AdminTest.php
└── Unit/
    └── Services/
        └── ThreadServiceTest.php
```

---

### 認証テスト（`tests/Feature/Auth/AuthTest.php`）

```php
<?php

use App\Models\User;

// 求職者登録
it('求職者が登録できる', function () {
    $response = $this->postJson('/api/auth/register/jobseeker', [
        'email' => 'jobseeker@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', [
        'email' => 'jobseeker@example.com',
        'role' => 'jobseeker',
    ]);
});

// 企業登録
it('企業が登録できる', function () {
    $response = $this->postJson('/api/auth/register/company', [
        'email' => 'company@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['role' => 'company']);
});

// ログイン
it('正しい認証情報でログインできる', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => 'password',
        'role' => 'jobseeker',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
             ->assertJsonPath('data.user.role', 'jobseeker')
             ->assertJsonStructure(['data' => ['token', 'user']]);
});

// 間違ったパスワード
it('間違ったパスワードではログインできない', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'wrong_password',
    ])->assertStatus(401);
});

// ログアウト
it('ログアウトできる', function () {
    $user = User::factory()->jobseeker()->create();

    $this->actingAs($user)
         ->postJson('/api/auth/logout')
         ->assertStatus(200);
});
```

---

### 求人テスト（`tests/Feature/Job/JobTest.php`）

```php
<?php

use App\Models\User;
use App\Models\Job;
use App\Models\CompanyProfile;

// 未認証でも求人一覧を取得できる
it('未認証ユーザーが求人一覧を取得できる', function () {
    $this->getJson('/api/jobs')->assertStatus(200);
});

// 企業のみ求人を作成できる
it('企業ユーザーが求人を作成できる', function () {
    $user = User::factory()->company()->create();
    CompanyProfile::factory()->for($user)->create();

    $this->actingAs($user)
         ->postJson('/api/jobs', [
             'title' => 'テスト求人',
             'status' => 'draft',
         ])
         ->assertStatus(201);
});

// 求職者は求人を作成できない
it('求職者ユーザーは求人を作成できない', function () {
    $user = User::factory()->jobseeker()->create();

    $this->actingAs($user)
         ->postJson('/api/jobs', ['title' => 'テスト求人'])
         ->assertStatus(403);
});

// 他社の求人は編集できない
it('他社の求人は編集できない', function () {
    $company1 = User::factory()->company()->create();
    $company2 = User::factory()->company()->create();
    $profile2 = CompanyProfile::factory()->for($company2)->create();
    $job = Job::factory()->for($profile2, 'company')->create();

    $this->actingAs($company1)
         ->putJson("/api/jobs/{$job->id}", ['title' => '改ざん'])
         ->assertStatus(403);
});

// 公開中の求人のみ未認証ユーザーに返す
it('下書き求人は未認証ユーザーに返さない', function () {
    $company = User::factory()->company()->create();
    $profile = CompanyProfile::factory()->for($company)->create();
    $job = Job::factory()->for($profile, 'company')->create(['status' => 'draft']);

    $this->getJson("/api/jobs/{$job->id}")->assertStatus(404);
});
```

---

### 応募テスト（`tests/Feature/Application/ApplicationTest.php`）

```php
<?php

// 求職者が求人に応募できる
it('求職者が求人に応募できる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $job = Job::factory()->published()->create();

    $this->actingAs($jobseeker)
         ->postJson("/api/jobs/{$job->id}/apply")
         ->assertStatus(201);

    $this->assertDatabaseHas('applications', [
        'job_id' => $job->id,
        'jobseeker_id' => $jobseeker->id,
        'status' => 'applied',
    ]);
});

// 二重応募できない
it('同じ求人に二重応募できない', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $job = Job::factory()->published()->create();

    $this->actingAs($jobseeker)->postJson("/api/jobs/{$job->id}/apply");

    // 2回目の応募
    $this->actingAs($jobseeker)
         ->postJson("/api/jobs/{$job->id}/apply")
         ->assertStatus(422);
});

// 企業は応募できない
it('企業ユーザーは求人に応募できない', function () {
    $company = User::factory()->company()->create();
    $job = Job::factory()->published()->create();

    $this->actingAs($company)
         ->postJson("/api/jobs/{$job->id}/apply")
         ->assertStatus(403);
});

// 企業が選考ステータスを変更できる
it('企業が応募の選考ステータスを変更できる', function () {
    $company = User::factory()->company()->create();
    $profile = CompanyProfile::factory()->for($company)->create();
    $job = Job::factory()->for($profile, 'company')->published()->create();
    $jobseeker = User::factory()->jobseeker()->create();
    $application = Application::factory()->for($job)->create(['jobseeker_id' => $jobseeker->id]);

    $this->actingAs($company)
         ->putJson("/api/applications/{$application->id}/status", ['status' => 'screening'])
         ->assertStatus(200)
         ->assertJsonPath('data.status', 'screening');
});
```

---

### 求職者プロフィールテスト（`tests/Feature/JobseekerProfile/JobseekerProfileTest.php`）

```php
<?php

// 企業ログイン時は連絡先・履歴書URLが返る
it('企業ログイン時は求職者の連絡先が含まれる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->public()->create([
        'resume_path' => 'resumes/test.pdf',
    ]);

    $company = User::factory()->company()->create();

    $response = $this->actingAs($company)
                     ->getJson("/api/jobseekers/{$jobseeker->jobseekerProfile->id}")
                     ->assertStatus(200);

    $response->assertJsonStructure(['data' => ['email', 'resume_url']]);
});

// 未認証時は連絡先・履歴書URLが含まれない
it('未認証時は求職者の連絡先が含まれない', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->public()->create();

    $this->getJson("/api/jobseekers/{$jobseeker->jobseekerProfile->id}")
         ->assertStatus(200)
         ->assertJsonMissing(['email'])
         ->assertJsonMissing(['resume_url']);
});

// 非公開プロフィールは返さない
it('非公開の求職者プロフィールは一覧に含まれない', function () {
    JobseekerProfile::factory()->create(['is_public' => false]);

    $this->getJson('/api/jobseekers')
         ->assertStatus(200)
         ->assertJsonCount(0, 'data');
});
```

---

### 管理者テスト（`tests/Feature/Admin/AdminTest.php`）

```php
<?php

// 管理者以外は管理者APIにアクセスできない
it('求職者ユーザーは管理者APIにアクセスできない', function () {
    $jobseeker = User::factory()->jobseeker()->create();

    $this->actingAs($jobseeker)
         ->getJson('/api/admin/users')
         ->assertStatus(403);
});

it('企業ユーザーは管理者APIにアクセスできない', function () {
    $company = User::factory()->company()->create();

    $this->actingAs($company)
         ->getJson('/api/admin/users')
         ->assertStatus(403);
});

it('管理者はユーザー一覧を取得できる', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(3)->jobseeker()->create();

    $this->actingAs($admin)
         ->getJson('/api/admin/users')
         ->assertStatus(200);
});
```

---

## フロントエンドテスト（Jest）

### セットアップ

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### テストファイル構成

```
frontend/src/__tests__/
├── components/
│   ├── JobCard.test.tsx
│   └── JobFilter.test.tsx
└── lib/
    └── format.test.ts
```

### コンポーネントテスト例

```typescript
// src/__tests__/components/JobCard.test.tsx
import { render, screen } from '@testing-library/react'
import JobCard from '@/components/jobs/JobCard'

const mockJob = {
  id: '1',
  title: 'テスト求人',
  company: { id: '1', name: '株式会社テスト' },
  prefecture: { id: '1', name: '東京都' },
  employmentType: 'full_time',
  status: 'published' as const,
  createdAt: '2024-01-01T00:00:00Z',
}

it('求人タイトルが表示される', () => {
  render(<JobCard job={mockJob} />)
  expect(screen.getByText('テスト求人')).toBeInTheDocument()
})

it('企業名が表示される', () => {
  render(<JobCard job={mockJob} />)
  expect(screen.getByText('株式会社テスト')).toBeInTheDocument()
})
```

---

## GitHub Actions設定（`.github/workflows/ci.yml`）

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: matching_db_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.3'
          extensions: pdo, pdo_pgsql, redis

      - name: Install dependencies
        run: cd backend && composer install --no-interaction

      - name: Copy .env
        run: cd backend && cp .env.example .env && php artisan key:generate

      - name: Run migrations
        run: cd backend && php artisan migrate --env=testing

      - name: Run tests
        run: cd backend && ./vendor/bin/pest --ci

  frontend-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: cd frontend && npm ci

      - name: Run tests
        run: cd frontend && npm test -- --ci

      - name: Type check
        run: cd frontend && npm run type-check

      - name: Lint
        run: cd frontend && npm run lint
```

---

## テスト実行コマンド

### バックエンド

```bash
# 全テスト実行
cd backend && ./vendor/bin/pest

# 特定ファイルのみ
cd backend && ./vendor/bin/pest tests/Feature/Auth/AuthTest.php

# カバレッジ付き
cd backend && ./vendor/bin/pest --coverage
```

### フロントエンド

```bash
# 全テスト実行
cd frontend && npm test

# ウォッチモード
cd frontend && npm test -- --watch

# カバレッジ付き
cd frontend && npm test -- --coverage
```
