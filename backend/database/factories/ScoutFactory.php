<?php

namespace Database\Factories;

use App\Models\Scout;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ScoutFactory extends Factory
{
    protected $model = Scout::class;

    public function definition(): array
    {
        return [
            'company_id' => User::factory()->company(),
            'jobseeker_id' => User::factory()->jobseeker(),
            'job_id' => null,
            'message' => fake()->paragraph(),
            'status' => 'unread',
        ];
    }

    public function read(): static
    {
        return $this->state(['status' => 'read']);
    }

    public function replied(): static
    {
        return $this->state(['status' => 'replied']);
    }
}
