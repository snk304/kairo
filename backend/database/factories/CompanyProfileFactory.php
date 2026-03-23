<?php

namespace Database\Factories;

use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyProfileFactory extends Factory
{
    protected $model = CompanyProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->company(),
            'name' => fake()->company(),
            'industry' => 'IT・通信',
            'employee_count' => fake()->numberBetween(10, 1000),
            'disabled_hire_count' => fake()->numberBetween(0, 10),
        ];
    }
}
