<?php

use App\Models\CompanyProfile;
use App\Models\Job;
use App\Models\User;

it('未認証ユーザーが求人一覧を取得できる', function () {
    $this->getJson('/api/jobs')->assertStatus(200);
});

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

it('求職者ユーザーは求人を作成できない', function () {
    $user = User::factory()->jobseeker()->create();

    $this->actingAs($user)
         ->postJson('/api/jobs', ['title' => 'テスト求人'])
         ->assertStatus(403);
});

it('他社の求人は編集できない', function () {
    $company1 = User::factory()->company()->create();
    CompanyProfile::factory()->for($company1)->create();

    $company2 = User::factory()->company()->create();
    $profile2 = CompanyProfile::factory()->for($company2)->create();
    $job = Job::factory()->for($profile2, 'company')->create();

    $this->actingAs($company1)
         ->putJson("/api/jobs/{$job->id}", ['title' => '改ざん'])
         ->assertStatus(403);
});

it('下書き求人は未認証ユーザーに返さない', function () {
    $company = User::factory()->company()->create();
    $profile = CompanyProfile::factory()->for($company)->create();
    $job = Job::factory()->for($profile, 'company')->create(['status' => 'draft']);

    $this->getJson("/api/jobs/{$job->id}")->assertStatus(404);
});
