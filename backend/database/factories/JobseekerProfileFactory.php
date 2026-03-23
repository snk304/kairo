<?php

namespace Database\Factories;

use App\Models\JobseekerProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobseekerProfileFactory extends Factory
{
    protected $model = JobseekerProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->jobseeker(),
            'last_name' => fake()->lastName(),
            'first_name' => fake()->firstName(),
            'last_name_kana' => 'ヤマダ',
            'first_name_kana' => 'タロウ',
            'is_public' => true,
        ];
    }

    public function public(): static
    {
        return $this->state(['is_public' => true]);
    }

    public function private(): static
    {
        return $this->state(['is_public' => false]);
    }
}
