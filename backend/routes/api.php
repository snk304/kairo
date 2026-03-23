<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CompanyProfileController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\JobseekerProfileController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ScoutController;
use App\Http\Controllers\ThreadController;
use Illuminate\Support\Facades\Route;

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
// {id} は ULID（26文字）のみマッチ。"me" 等のキーワードは通過させない
Route::get('jobseekers', [JobseekerProfileController::class, 'index']);
Route::get('jobseekers/{id}', [JobseekerProfileController::class, 'show'])->where('id', '[0-9a-zA-Z]{26}');
Route::get('companies/{id}', [CompanyProfileController::class, 'show'])->where('id', '[0-9a-zA-Z]{26}');
Route::get('jobs', [JobController::class, 'index']);
Route::get('jobs/{id}', [JobController::class, 'show'])->where('id', '[0-9a-zA-Z]{26}');

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
