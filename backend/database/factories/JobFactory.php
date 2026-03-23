<?php

namespace Database\Factories;

use App\Models\CompanyProfile;
use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        return [
            'company_id' => CompanyProfile::factory(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraph(),
            'employment_type' => 'full_time',
            'work_style' => 'office',
            'salary_min' => 200000,
            'salary_max' => 300000,
            'status' => 'draft',
        ];
    }

    public function published(): static
    {
        return $this->state(['status' => 'published']);
    }
}
