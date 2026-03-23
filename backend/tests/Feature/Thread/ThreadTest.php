<?php

use App\Models\CompanyProfile;
use App\Models\JobseekerProfile;
use App\Models\Message;
use App\Models\Thread;
use App\Models\User;

it('スレッド一覧を取得できる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $company = User::factory()->company()->create();

    Thread::factory()->create([
        'jobseeker_id' => $jobseeker->id,
        'company_id' => $company->id,
    ]);

    $this->actingAs($jobseeker)
         ->getJson('/api/threads')
         ->assertStatus(200)
         ->assertJsonStructure(['data', 'meta']);
});

it('スレッド詳細を取得できる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    JobseekerProfile::factory()->for($jobseeker)->create();

    $company = User::factory()->company()->create();
    CompanyProfile::factory()->for($company)->create();

    $thread = Thread::factory()->create([
        'jobseeker_id' => $jobseeker->id,
        'company_id' => $company->id,
    ]);

    $this->actingAs($jobseeker)
         ->getJson("/api/threads/{$thread->id}")
         ->assertStatus(200)
         ->assertJsonStructure(['data' => ['messages']]);
});

it('他のユーザーのスレッドは取得できない', function () {
    $jobseeker1 = User::factory()->jobseeker()->create();
    $jobseeker2 = User::factory()->jobseeker()->create();
    $company = User::factory()->company()->create();

    $thread = Thread::factory()->create([
        'jobseeker_id' => $jobseeker2->id,
        'company_id' => $company->id,
    ]);

    $this->actingAs($jobseeker1)
         ->getJson("/api/threads/{$thread->id}")
         ->assertStatus(403);
});

it('メッセージを送信できる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $company = User::factory()->company()->create();

    $thread = Thread::factory()->create([
        'jobseeker_id' => $jobseeker->id,
        'company_id' => $company->id,
    ]);

    $this->actingAs($jobseeker)
         ->postJson("/api/threads/{$thread->id}/messages", [
             'body' => 'こんにちは、よろしくお願いします。',
         ])
         ->assertStatus(201)
         ->assertJsonPath('data.body', 'こんにちは、よろしくお願いします。');

    $this->assertDatabaseHas('messages', [
        'thread_id' => $thread->id,
        'sender_id' => $jobseeker->id,
        'body' => 'こんにちは、よろしくお願いします。',
    ]);
});

it('スレッドを既読にできる', function () {
    $jobseeker = User::factory()->jobseeker()->create();
    $company = User::factory()->company()->create();

    $thread = Thread::factory()->create([
        'jobseeker_id' => $jobseeker->id,
        'company_id' => $company->id,
    ]);

    Message::factory()->create([
        'thread_id' => $thread->id,
        'sender_id' => $company->id,
        'is_read' => false,
    ]);

    $this->actingAs($jobseeker)
         ->putJson("/api/threads/{$thread->id}/read")
         ->assertStatus(200)
         ->assertJson(['message' => 'marked as read']);

    $this->assertDatabaseHas('messages', [
        'thread_id' => $thread->id,
        'sender_id' => $company->id,
        'is_read' => true,
    ]);
});
