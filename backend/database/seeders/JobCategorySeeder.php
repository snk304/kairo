<?php

namespace Database\Seeders;

use App\Models\JobCategory;
use Illuminate\Database\Seeder;

class JobCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            '事務・管理',
            'IT・エンジニア',
            '営業・販売',
            '製造・軽作業',
            'デザイン・クリエイティブ',
            '医療・福祉',
            '教育・保育',
            '飲食・サービス',
            '物流・配送',
            'その他',
        ];

        foreach ($categories as $name) {
            JobCategory::firstOrCreate(['name' => $name]);
        }
    }
}
