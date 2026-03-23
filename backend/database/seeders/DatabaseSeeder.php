<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            PrefectureSeeder::class,
            DisabilityTypeSeeder::class,
            JobCategorySeeder::class,
            UserSeeder::class,
        ]);
    }
}
