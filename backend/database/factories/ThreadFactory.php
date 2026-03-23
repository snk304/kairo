<?php

namespace Database\Factories;

use App\Models\Thread;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ThreadFactory extends Factory
{
    protected $model = Thread::class;

    public function definition(): array
    {
        return [
            'jobseeker_id' => User::factory()->jobseeker(),
            'company_id' => User::factory()->company(),
            'application_id' => null,
            'scout_id' => null,
        ];
    }
}
