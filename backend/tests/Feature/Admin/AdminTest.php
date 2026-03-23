<?php

use App\Models\User;

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
