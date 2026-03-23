<?php

use App\Models\Application;
use App\Models\CompanyProfile;
use App\Models\Job;
use App\Models\User;

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

it('同じ求人に二重応募できない', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $job = Job::factory()->published()->create();

    $this->actingAs($jobseeker)->postJson("/api/jobs/{$job->id}/apply");

    $this->actingAs($jobseeker)
         ->postJson("/api/jobs/{$job->id}/apply")
         ->assertStatus(422);
});

it('企業ユーザーは求人に応募できない', function () {
    $company = User::factory()->company()->create();
    CompanyProfile::factory()->for($company)->create();
    $job = Job::factory()->published()->create();

    $this->actingAs($company)
         ->postJson("/api/jobs/{$job->id}/apply")
         ->assertStatus(403);
});

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
