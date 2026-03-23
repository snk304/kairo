<?php

use App\Models\JobseekerProfile;
use App\Models\User;

it('企業ログイン時は求職者の連絡先が含まれる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->public()->create();

    $company = User::factory()->company()->create();

    $response = $this->actingAs($company)
                     ->getJson("/api/jobseekers/{$jobseeker->jobseekerProfile->id}")
                     ->assertStatus(200);

    $response->assertJsonStructure(['data' => ['email']]);
});

it('未認証時は求職者の連絡先が含まれない', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->public()->create();

    $this->getJson("/api/jobseekers/{$jobseeker->jobseekerProfile->id}")
         ->assertStatus(200)
         ->assertJsonMissing(['email'])
         ->assertJsonMissing(['resume_url']);
});

it('非公開の求職者プロフィールは一覧に含まれない', function () {
    JobseekerProfile::factory()->private()->create();

    $this->getJson('/api/jobseekers')
         ->assertStatus(200)
         ->assertJsonCount(0, 'data');
});
