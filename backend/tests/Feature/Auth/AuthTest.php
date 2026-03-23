<?php

use App\Models\User;

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

it('企業が登録できる', function () {
    $response = $this->postJson('/api/auth/register/company', [
        'email' => 'company@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseHas('users', ['role' => 'company']);
});

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

it('間違ったパスワードではログインできない', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'wrong_password',
    ])->assertStatus(401);
});

it('ログアウトできる', function () {
    $user = User::factory()->jobseeker()->create();

    $this->actingAs($user)
         ->postJson('/api/auth/logout')
         ->assertStatus(200);
});
