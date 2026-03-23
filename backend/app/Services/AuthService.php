<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(string $email, string $password, string $role): User
    {
        return User::create([
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'email_verified_at' => now(), // メール認証は後で実装
        ]);
    }

    public function login(string $email, string $password): array
    {
        if (!Auth::attempt(['email' => $email, 'password' => $password])) {
            throw ValidationException::withMessages([
                'email' => ['認証情報が正しくありません。'],
            ])->status(401);
        }

        /** @var User $user */
        $user = Auth::user();
        $token = $user->createToken('api-token')->plainTextToken;

        return ['token' => $token, 'user' => $user];
    }
}
