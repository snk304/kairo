<?php

use App\Models\CompanyProfile;
use App\Models\JobseekerProfile;
use App\Models\Scout;
use App\Models\User;

it('企業ユーザーがスカウトを送れる', function () {
    $company = User::factory()->company()->create();
    CompanyProfile::factory()->for($company)->create();

    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->create();

    $this->actingAs($company)
         ->postJson('/api/scouts', [
             'jobseeker_id' => $jobseeker->id,
             'message' => 'ぜひ弊社にご応募ください。',
         ])
         ->assertStatus(201)
         ->assertJsonPath('data.status', 'unread');

    $this->assertDatabaseHas('scouts', [
        'company_id' => $company->id,
        'jobseeker_id' => $jobseeker->id,
    ]);
});

it('求職者ユーザーはスカウトを送れない', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $otherJobseeker = User::factory()->jobseeker()->create();

    $this->actingAs($jobseeker)
         ->postJson('/api/scouts', [
             'jobseeker_id' => $otherJobseeker->id,
             'message' => '不正送信',
         ])
         ->assertStatus(403);
});

it('求職者がスカウト一覧（received）を取得できる', function () {
    $company = User::factory()->company()->create();
    $jobseeker = User::factory()->jobseeker()->create();

    Scout::factory()->create([
        'company_id' => $company->id,
        'jobseeker_id' => $jobseeker->id,
    ]);

    $this->actingAs($jobseeker)
         ->getJson('/api/scouts/received')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta']);
});

it('企業がスカウト一覧（sent）を取得できる', function () {
    $company = User::factory()->company()->create();
    $jobseeker = User::factory()->jobseeker()->create();

    Scout::factory()->create([
        'company_id' => $company->id,
        'jobseeker_id' => $jobseeker->id,
    ]);

    $this->actingAs($company)
         ->getJson('/api/scouts/sent')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta']);
});

it('スカウトを既読にできる', function () {
    $company = User::factory()->company()->create();
    $jobseeker = User::factory()->jobseeker()->create();

    $scout = Scout::factory()->create([
        'company_id' => $company->id,
        'jobseeker_id' => $jobseeker->id,
        'status' => 'unread',
    ]);

    $this->actingAs($jobseeker)
         ->putJson("/api/scouts/{$scout->id}/read")
         ->assertStatus(200)
         ->assertJsonPath('data.status', 'read');

    $this->assertDatabaseHas('scouts', [
        'id' => $scout->id,
        'status' => 'read',
    ]);
});

it('スカウトに返信できる', function () {
    $company = User::factory()->company()->create();
    CompanyProfile::factory()->for($company)->create();

    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->create();

    $scout = Scout::factory()->create([
        'company_id' => $company->id,
        'jobseeker_id' => $jobseeker->id,
        'status' => 'unread',
    ]);

    $this->actingAs($jobseeker)
         ->putJson("/api/scouts/{$scout->id}/reply", [
             'message' => 'ご連絡ありがとうございます。',
         ])
         ->assertStatus(200)
         ->assertJsonPath('data.status', 'replied');

    $this->assertDatabaseHas('scouts', [
        'id' => $scout->id,
        'status' => 'replied',
    ]);
});
