# 02_database.md — DB設計・マイグレーション・シーダー仕様

## 概要

PostgreSQL 16を使用する。
全テーブルのPKはULIDを使用する（`Str::ulid()`）。
マイグレーションは以下の順番で作成・実行する。

---

## マイグレーション実行順序

1. `prefectures`
2. `disability_types`
3. `job_categories`
4. `users`
5. `jobseeker_profiles`
6. `company_profiles`
7. `jobs`
8. `applications`
9. `scouts`
10. `threads`
11. `messages`
12. `notifications`
13. `contacts`

---

## 各テーブルのマイグレーション定義

### prefectures

```php
Schema::create('prefectures', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name');
    $table->timestamps();
});
```

### disability_types

```php
Schema::create('disability_types', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name');
    $table->timestamps();
});
```

### job_categories

```php
Schema::create('job_categories', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name');
    $table->timestamps();
});
```

### users

```php
Schema::create('users', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['jobseeker', 'company', 'admin']);
    $table->timestamp('email_verified_at')->nullable();
    $table->rememberToken();
    $table->timestamps();

    $table->index('role');
});
```

### jobseeker_profiles

```php
Schema::create('jobseeker_profiles', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
    $table->string('last_name');
    $table->string('first_name');
    $table->string('last_name_kana');
    $table->string('first_name_kana');
    $table->date('birth_date')->nullable();
    $table->string('gender')->nullable();
    $table->foreignUlid('prefecture_id')->nullable()->constrained();
    $table->foreignUlid('disability_type_id')->nullable()->constrained();
    $table->string('disability_grade')->nullable();
    $table->string('nearest_station')->nullable();
    $table->foreignUlid('desired_job_category_id')->nullable()->constrained('job_categories');
    $table->string('desired_employment_type')->nullable();
    $table->string('desired_work_style')->nullable();
    $table->integer('desired_salary')->nullable();
    $table->text('self_pr')->nullable();
    $table->string('resume_path')->nullable();
    $table->boolean('is_public')->default(true);
    $table->timestamps();

    $table->unique('user_id');
    $table->index('is_public');
    $table->index('disability_type_id');
    $table->index('desired_job_category_id');
    $table->index('prefecture_id');
});
```

### company_profiles

```php
Schema::create('company_profiles', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('industry')->nullable();
    $table->integer('employee_count')->nullable();
    $table->foreignUlid('prefecture_id')->nullable()->constrained();
    $table->string('address')->nullable();
    $table->text('description')->nullable();
    $table->integer('disabled_hire_count')->default(0);
    $table->jsonb('considerations')->nullable();
    $table->timestamps();

    $table->unique('user_id');
});
```

### jobs

```php
Schema::create('jobs', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('company_id')->constrained('company_profiles')->cascadeOnDelete();
    $table->foreignUlid('job_category_id')->nullable()->constrained();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('employment_type')->nullable();
    $table->string('work_style')->nullable();
    $table->integer('salary_min')->nullable();
    $table->integer('salary_max')->nullable();
    $table->foreignUlid('prefecture_id')->nullable()->constrained();
    $table->jsonb('considerations')->nullable();
    $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
    $table->timestamps();

    $table->index('company_id');
    $table->index('status');
    $table->index('job_category_id');
    $table->index('prefecture_id');
    $table->index(['status', 'created_at']);
});
```

### applications

```php
Schema::create('applications', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('job_id')->constrained()->cascadeOnDelete();
    $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
    $table->enum('status', ['applied', 'screening', 'interview', 'offered', 'rejected'])
          ->default('applied');
    $table->timestamps();

    $table->unique(['job_id', 'jobseeker_id']); // 二重応募防止
    $table->index('job_id');
    $table->index('jobseeker_id');
});
```

### scouts

```php
Schema::create('scouts', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('company_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUlid('job_id')->nullable()->constrained()->nullOnDelete();
    $table->text('message');
    $table->enum('status', ['unread', 'read', 'replied'])->default('unread');
    $table->timestamps();

    $table->index('company_id');
    $table->index('jobseeker_id');
    $table->index(['company_id', 'jobseeker_id']);
});
```

### threads

```php
Schema::create('threads', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUlid('company_id')->constrained('users')->cascadeOnDelete();
    $table->foreignUlid('application_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignUlid('scout_id')->nullable()->constrained()->nullOnDelete();
    $table->timestamps();

    $table->index('jobseeker_id');
    $table->index('company_id');
    $table->index('application_id');
    $table->index('scout_id');
});
```

### messages

```php
Schema::create('messages', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('thread_id')->constrained()->cascadeOnDelete();
    $table->foreignUlid('sender_id')->constrained('users')->cascadeOnDelete();
    $table->text('body');
    $table->boolean('is_read')->default(false);
    $table->timestamp('created_at')->useCurrent();

    $table->index('thread_id');
    $table->index(['thread_id', 'is_read']);
});
```

### notifications

```php
Schema::create('notifications', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
    $table->string('type');
    $table->jsonb('data')->nullable();
    $table->timestamp('read_at')->nullable();
    $table->timestamp('created_at')->useCurrent();

    $table->index(['user_id', 'read_at']);
});
```

### contacts

```php
Schema::create('contacts', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name');
    $table->string('email');
    $table->text('body');
    $table->timestamp('created_at')->useCurrent();
});
```

---

## Eloquentモデル定義

### User モデル（`app/Models/User.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasUlids;

    protected $fillable = ['email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function jobseekerProfile()
    {
        return $this->hasOne(JobseekerProfile::class);
    }

    public function companyProfile()
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function isJobseeker(): bool
    {
        return $this->role === 'jobseeker';
    }

    public function isCompany(): bool
    {
        return $this->role === 'company';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
```

### JobseekerProfile モデル（`app/Models/JobseekerProfile.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class JobseekerProfile extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'last_name', 'first_name', 'last_name_kana', 'first_name_kana',
        'birth_date', 'gender', 'prefecture_id', 'disability_type_id', 'disability_grade',
        'nearest_station', 'desired_job_category_id', 'desired_employment_type',
        'desired_work_style', 'desired_salary', 'self_pr', 'resume_path', 'is_public',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_public' => 'boolean',
        'desired_salary' => 'integer',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function prefecture() { return $this->belongsTo(Prefecture::class); }
    public function disabilityType() { return $this->belongsTo(DisabilityType::class); }
    public function desiredJobCategory() { return $this->belongsTo(JobCategory::class, 'desired_job_category_id'); }

    public function scopePublic($query) { return $query->where('is_public', true); }
}
```

### CompanyProfile モデル（`app/Models/CompanyProfile.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id', 'name', 'industry', 'employee_count', 'prefecture_id',
        'address', 'description', 'disabled_hire_count', 'considerations',
    ];

    protected $casts = [
        'considerations' => 'array',
        'employee_count' => 'integer',
        'disabled_hire_count' => 'integer',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function prefecture() { return $this->belongsTo(Prefecture::class); }
    public function jobs() { return $this->hasMany(Job::class, 'company_id'); }
}
```

### Job モデル（`app/Models/Job.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Job extends Model
{
    use HasUlids, Searchable;

    protected $fillable = [
        'company_id', 'job_category_id', 'title', 'description',
        'employment_type', 'work_style', 'salary_min', 'salary_max',
        'prefecture_id', 'considerations', 'status',
    ];

    protected $casts = [
        'considerations' => 'array',
        'salary_min' => 'integer',
        'salary_max' => 'integer',
    ];

    public function company() { return $this->belongsTo(CompanyProfile::class, 'company_id'); }
    public function jobCategory() { return $this->belongsTo(JobCategory::class); }
    public function prefecture() { return $this->belongsTo(Prefecture::class); }
    public function applications() { return $this->hasMany(Application::class); }

    public function scopePublished($query) { return $query->where('status', 'published'); }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'employment_type' => $this->employment_type,
            'work_style' => $this->work_style,
            'status' => $this->status,
        ];
    }
}
```

### Application モデル（`app/Models/Application.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasUlids;

    protected $fillable = ['job_id', 'jobseeker_id', 'status'];

    public function job() { return $this->belongsTo(Job::class); }
    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function thread() { return $this->hasOne(Thread::class); }
}
```

### Scout モデル（`app/Models/Scout.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Scout extends Model
{
    use HasUlids;

    protected $fillable = ['company_id', 'jobseeker_id', 'job_id', 'message', 'status'];

    public function company() { return $this->belongsTo(User::class, 'company_id'); }
    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function job() { return $this->belongsTo(Job::class); }
    public function thread() { return $this->hasOne(Thread::class); }
}
```

### Thread モデル（`app/Models/Thread.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Thread extends Model
{
    use HasUlids;

    protected $fillable = ['jobseeker_id', 'company_id', 'application_id', 'scout_id'];

    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function company() { return $this->belongsTo(User::class, 'company_id'); }
    public function messages() { return $this->hasMany(Message::class)->orderBy('created_at'); }
    public function latestMessage() { return $this->hasOne(Message::class)->latestOfMany(); }

    public function unreadCount(string $userId): int
    {
        return $this->messages()->where('is_read', false)->where('sender_id', '!=', $userId)->count();
    }
}
```

### Message モデル（`app/Models/Message.php`）

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $fillable = ['thread_id', 'sender_id', 'body', 'is_read'];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function thread() { return $this->belongsTo(Thread::class); }
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
```

---

## シーダー定義

### DatabaseSeeder（`database/seeders/DatabaseSeeder.php`）

```php
public function run(): void
{
    $this->call([
        PrefectureSeeder::class,
        DisabilityTypeSeeder::class,
        JobCategorySeeder::class,
        UserSeeder::class,
    ]);
}
```

### PrefectureSeeder

47都道府県を投入する。

```php
$prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県',
    '山形県', '福島県', '茨城県', '栃木県', '群馬県',
    '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県',
    '富山県', '石川県', '福井県', '山梨県', '長野県',
    '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県',
    '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県',
    '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県',
    '鹿児島県', '沖縄県',
];
```

### DisabilityTypeSeeder

```php
$types = [
    '視覚障害',
    '聴覚障害・平衡機能障害',
    '音声・言語・そしゃく機能障害',
    '肢体不自由',
    '内部障害（心臓・腎臓・呼吸器など）',
];
```

### JobCategorySeeder

```php
$categories = [
    '事務・管理',
    'IT・エンジニア',
    '営業・販売',
    '製造・軽作業',
    'デザイン・クリエイティブ',
    '医療・福祉',
    '教育・保育',
    '飲食・サービス',
    '物流・配送',
    'その他',
];
```

### UserSeeder（開発用テストデータ）

以下のテストユーザーを作成する。

```php
// 管理者
User::create([
    'email' => 'admin@example.com',
    'password' => 'password',
    'role' => 'admin',
    'email_verified_at' => now(),
]);

// 求職者（5名）
// jobseeker1@example.com 〜 jobseeker5@example.com
// password: password
// JobseekerProfileも合わせて作成する

// 企業（3社）
// company1@example.com 〜 company3@example.com
// password: password
// CompanyProfileも合わせて作成する
// 各企業に求人を2〜3件作成する
```
