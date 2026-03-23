# 03_backend.md — Laravelバックエンド実装仕様

## ディレクトリ構成

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   ├── JobseekerProfileController.php
│   │   │   ├── CompanyProfileController.php
│   │   │   ├── JobController.php
│   │   │   ├── ApplicationController.php
│   │   │   ├── ScoutController.php
│   │   │   ├── ThreadController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ContactController.php
│   │   │   ├── MasterController.php
│   │   │   └── Admin/
│   │   │       └── AdminController.php
│   │   ├── Requests/
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   └── LoginRequest.php
│   │   │   ├── JobseekerProfileRequest.php
│   │   │   ├── CompanyProfileRequest.php
│   │   │   ├── JobRequest.php
│   │   │   ├── ScoutRequest.php
│   │   │   └── MessageRequest.php
│   │   ├── Resources/
│   │   │   ├── UserResource.php
│   │   │   ├── JobseekerProfileResource.php
│   │   │   ├── CompanyProfileResource.php
│   │   │   ├── JobResource.php
│   │   │   ├── ApplicationResource.php
│   │   │   ├── ScoutResource.php
│   │   │   ├── ThreadResource.php
│   │   │   ├── MessageResource.php
│   │   │   └── NotificationResource.php
│   │   └── Middleware/
│   │       ├── EnsureRole.php
│   │       └── EnsureEmailVerified.php
│   ├── Models/           # 02_database.md 参照
│   ├── Policies/
│   │   ├── JobPolicy.php
│   │   ├── ApplicationPolicy.php
│   │   ├── ScoutPolicy.php
│   │   └── ThreadPolicy.php
│   └── Services/
│       ├── AuthService.php
│       ├── JobseekerProfileService.php
│       ├── CompanyProfileService.php
│       ├── JobService.php
│       ├── ApplicationService.php
│       ├── ScoutService.php
│       └── ThreadService.php
├── routes/
│   └── api.php
└── config/
    └── cors.php
```

---

## ルーティング（`routes/api.php`）

```php
<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\JobseekerProfileController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\ScoutController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\Admin\AdminController;

// ヘルスチェック
Route::get('/health', fn() => response()->json(['status' => 'ok']));

// マスタ（認証不要）
Route::prefix('master')->group(function () {
    Route::get('disability-types', [MasterController::class, 'disabilityTypes']);
    Route::get('job-categories', [MasterController::class, 'jobCategories']);
    Route::get('prefectures', [MasterController::class, 'prefectures']);
});

// 認証（認証不要）
Route::prefix('auth')->group(function () {
    Route::post('register/jobseeker', [AuthController::class, 'registerJobseeker']);
    Route::post('register/company', [AuthController::class, 'registerCompany']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('password/forgot', [AuthController::class, 'forgotPassword']);
    Route::post('password/reset', [AuthController::class, 'resetPassword']);
});

// 公開エンドポイント（認証不要）
Route::get('jobseekers', [JobseekerProfileController::class, 'index']);
Route::get('jobseekers/{id}', [JobseekerProfileController::class, 'show']);
Route::get('companies/{id}', [CompanyProfileController::class, 'show']);
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{id}', [JobController::class, 'show']);

// 認証必須
Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // 求職者プロフィール
    Route::prefix('jobseekers/me')->group(function () {
        Route::get('/', [JobseekerProfileController::class, 'showMe']);
        Route::post('/', [JobseekerProfileController::class, 'store']);
        Route::put('/', [JobseekerProfileController::class, 'update']);
        Route::post('resume', [JobseekerProfileController::class, 'uploadResume']);
        Route::delete('resume', [JobseekerProfileController::class, 'deleteResume']);
    });

    // 企業プロフィール
    Route::prefix('companies/me')->group(function () {
        Route::get('/', [CompanyProfileController::class, 'showMe']);
        Route::post('/', [CompanyProfileController::class, 'store']);
        Route::put('/', [CompanyProfileController::class, 'update']);
        Route::post('photos', [CompanyProfileController::class, 'uploadPhoto']);
        Route::delete('photos/{id}', [CompanyProfileController::class, 'deletePhoto']);
    });

    // 求人
    Route::get('jobs/me', [JobController::class, 'indexMe']);
    Route::post('jobs', [JobController::class, 'store']);
    Route::put('jobs/{id}', [JobController::class, 'update']);
    Route::delete('jobs/{id}', [JobController::class, 'destroy']);
    Route::put('jobs/{id}/status', [JobController::class, 'updateStatus']);

    // 応募
    Route::post('jobs/{id}/apply', [ApplicationController::class, 'store']);
    Route::get('applications/me', [ApplicationController::class, 'indexMe']);
    Route::get('jobs/{id}/applications', [ApplicationController::class, 'indexByJob']);
    Route::get('applications/{id}', [ApplicationController::class, 'show']);
    Route::put('applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // スカウト
    Route::post('scouts', [ScoutController::class, 'store']);
    Route::get('scouts/received', [ScoutController::class, 'received']);
    Route::get('scouts/sent', [ScoutController::class, 'sent']);
    Route::put('scouts/{id}/read', [ScoutController::class, 'markAsRead']);
    Route::put('scouts/{id}/reply', [ScoutController::class, 'reply']);

    // メッセージ
    Route::get('threads', [ThreadController::class, 'index']);
    Route::get('threads/{id}', [ThreadController::class, 'show']);
    Route::post('threads', [ThreadController::class, 'store']);
    Route::post('threads/{id}/messages', [ThreadController::class, 'sendMessage']);
    Route::put('threads/{id}/read', [ThreadController::class, 'markAsRead']);

    // 通知
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // お問い合わせ
    Route::post('contacts', [ContactController::class, 'store']);

    // 管理者
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('users', [AdminController::class, 'users']);
        Route::put('users/{id}/suspend', [AdminController::class, 'suspendUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('jobs', [AdminController::class, 'jobs']);
        Route::put('jobs/{id}/unpublish', [AdminController::class, 'unpublishJob']);
        Route::delete('jobs/{id}', [AdminController::class, 'deleteJob']);
        Route::get('contacts', [AdminController::class, 'contacts']);
        Route::get('stats', [AdminController::class, 'stats']);
    });
});
```

---

## ミドルウェア

### EnsureRole（`app/Http/Middleware/EnsureRole.php`）

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
```

`bootstrap/app.php` でエイリアスを登録する。

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\EnsureRole::class,
    ]);
})
```

---

## Policyクラス

### JobPolicy（`app/Policies/JobPolicy.php`）

```php
<?php

namespace App\Policies;

use App\Models\Job;
use App\Models\User;

class JobPolicy
{
    // 企業のみ作成可能
    public function create(User $user): bool
    {
        return $user->isCompany();
    }

    // 自社の求人のみ更新可能
    public function update(User $user, Job $job): bool
    {
        return $user->isCompany() && $user->companyProfile->id === $job->company_id;
    }

    // 自社の求人のみ削除可能
    public function delete(User $user, Job $job): bool
    {
        return $this->update($user, $job);
    }
}
```

### ApplicationPolicy（`app/Policies/ApplicationPolicy.php`）

```php
<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    // 求職者のみ応募可能
    public function create(User $user): bool
    {
        return $user->isJobseeker();
    }

    // ステータス変更は企業（自社求人のみ）
    public function updateStatus(User $user, Application $application): bool
    {
        if (!$user->isCompany()) return false;
        return $user->companyProfile->id === $application->job->company_id;
    }
}
```

### ScoutPolicy（`app/Policies/ScoutPolicy.php`）

```php
<?php

namespace App\Policies;

use App\Models\User;

class ScoutPolicy
{
    // 企業のみスカウト送信可能
    public function create(User $user): bool
    {
        return $user->isCompany();
    }
}
```

---

## API Resourceクラス

### JobseekerProfileResource（`app/Http/Resources/JobseekerProfileResource.php`）

企業ログイン時のみ連絡先・履歴書URLを返す。

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class JobseekerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isCompany = $user && $user->isCompany();

        $data = [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'disability_type' => $this->whenLoaded('disabilityType', fn() => [
                'id' => $this->disabilityType->id,
                'name' => $this->disabilityType->name,
            ]),
            'disability_grade' => $this->disability_grade,
            'desired_job_category' => $this->whenLoaded('desiredJobCategory', fn() => [
                'id' => $this->desiredJobCategory->id,
                'name' => $this->desiredJobCategory->name,
            ]),
            'prefecture' => $this->whenLoaded('prefecture', fn() => [
                'id' => $this->prefecture->id,
                'name' => $this->prefecture->name,
            ]),
            'desired_work_style' => $this->desired_work_style,
            'desired_employment_type' => $this->desired_employment_type,
            'desired_salary' => $this->desired_salary,
            'self_pr' => $this->self_pr,
        ];

        // 企業ログイン時のみ追加
        if ($isCompany) {
            $data['email'] = $this->user->email;
            $data['resume_url'] = $this->resume_path
                ? Storage::temporaryUrl($this->resume_path, now()->addMinutes(30))
                : null;
        }

        return $data;
    }
}
```

---

## FormRequestクラス

### JobseekerProfileRequest（`app/Http/Requests/JobseekerProfileRequest.php`）

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobseekerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isJobseeker();
    }

    public function rules(): array
    {
        return [
            'last_name' => ['required', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name_kana' => ['required', 'string', 'max:50', 'regex:/^[ァ-ヶー]+$/u'],
            'first_name_kana' => ['required', 'string', 'max:50', 'regex:/^[ァ-ヶー]+$/u'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'prefecture_id' => ['nullable', 'exists:prefectures,id'],
            'disability_type_id' => ['nullable', 'exists:disability_types,id'],
            'disability_grade' => ['nullable', 'string', 'max:20'],
            'nearest_station' => ['nullable', 'string', 'max:100'],
            'desired_job_category_id' => ['nullable', 'exists:job_categories,id'],
            'desired_employment_type' => ['nullable', 'in:general,special_subsidiary,support'],
            'desired_work_style' => ['nullable', 'in:full_time,part_time,remote,hybrid'],
            'desired_salary' => ['nullable', 'integer', 'min:0'],
            'self_pr' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['boolean'],
        ];
    }
}
```

### JobRequest（`app/Http/Requests/JobRequest.php`）

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCompany();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100'],
            'job_category_id' => ['nullable', 'exists:job_categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'employment_type' => ['nullable', 'in:full_time,part_time,contract,dispatch'],
            'work_style' => ['nullable', 'in:office,remote,hybrid'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'prefecture_id' => ['nullable', 'exists:prefectures,id'],
            'considerations' => ['nullable', 'array'],
            'considerations.facility' => ['nullable', 'array'],
            'considerations.work_style' => ['nullable', 'array'],
            'considerations.communication' => ['nullable', 'array'],
            'considerations.equipment' => ['nullable', 'array'],
            'status' => ['in:draft,published,closed'],
        ];
    }
}
```

---

## Serviceクラス

### ThreadService（`app/Services/ThreadService.php`）

スカウト返信・応募時のスレッド自動作成ロジック。

```php
<?php

namespace App\Services;

use App\Models\Thread;
use App\Models\Scout;
use App\Models\Application;

class ThreadService
{
    // スカウト返信時にスレッドを作成または取得
    public function findOrCreateByScout(Scout $scout): Thread
    {
        return Thread::firstOrCreate(
            ['scout_id' => $scout->id],
            [
                'jobseeker_id' => $scout->jobseeker_id,
                'company_id' => $scout->company_id,
            ]
        );
    }

    // 応募時にスレッドを作成または取得
    public function findOrCreateByApplication(Application $application): Thread
    {
        return Thread::firstOrCreate(
            ['application_id' => $application->id],
            [
                'jobseeker_id' => $application->jobseeker_id,
                'company_id' => $application->job->company_id,
            ]
        );
    }
}
```

---

## 通知の種類と発火タイミング

| 通知タイプ | 発火タイミング | 受信者 |
|-----------|-------------|--------|
| `scout_received` | スカウト送信時 | 求職者 |
| `scout_replied` | スカウト返信時 | 企業 |
| `application_received` | 応募時 | 企業 |
| `application_status_changed` | 選考ステータス変更時 | 求職者 |
| `message_received` | メッセージ送信時 | 相手方 |

通知はLaravel Notificationsのdatabaseチャンネルで保存し、
メール通知はMailableクラスで別途実装する。
