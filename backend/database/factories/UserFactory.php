<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => 'password',
            'role' => 'jobseeker',
            'email_verified_at' => now(),
        ];
    }

    public function jobseeker(): static
    {
        return $this->state(['role' => 'jobseeker']);
    }

    public function company(): static
    {
        return $this->state(['role' => 'company']);
    }

    public function admin(): static
    {
        return $this->state(['role' => 'admin']);
    }

    public function unverified(): static
    {
        return $this->state(['email_verified_at' => null]);
    }
}
