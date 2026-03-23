<?php

namespace Database\Seeders;

use App\Models\CompanyProfile;
use App\Models\DisabilityType;
use App\Models\Job;
use App\Models\JobCategory;
use App\Models\JobseekerProfile;
use App\Models\Prefecture;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 管理者
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'password' => 'password',
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $tokyo = Prefecture::where('name', '東京都')->first();
        $osaka = Prefecture::where('name', '大阪府')->first();
        $disability = DisabilityType::first();
        $itCategory = JobCategory::where('name', 'IT・エンジニア')->first();
        $adminCategory = JobCategory::where('name', '事務・管理')->first();

        // 求職者（5名）
        for ($i = 1; $i <= 5; $i++) {
            $user = User::firstOrCreate(
                ['email' => "jobseeker{$i}@example.com"],
                [
                    'password' => 'password',
                    'role' => 'jobseeker',
                    'email_verified_at' => now(),
                ]
            );

            JobseekerProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'last_name' => '求職者',
                    'first_name' => "太郎{$i}",
                    'last_name_kana' => 'キュウショクシャ',
                    'first_name_kana' => 'タロウ',
                    'gender' => 'male',
                    'prefecture_id' => $tokyo?->id,
                    'disability_type_id' => $disability?->id,
                    'disability_grade' => '3級',
                    'desired_job_category_id' => $itCategory?->id,
                    'desired_employment_type' => 'general',
                    'desired_work_style' => 'hybrid',
                    'desired_salary' => 250000 + ($i * 10000),
                    'self_pr' => "求職者{$i}のPRです。積極的に仕事に取り組みます。",
                    'is_public' => true,
                ]
            );
        }

        // 企業（3社）
        $companies = [
            ['name' => '株式会社テックソリューション', 'industry' => 'IT・通信'],
            ['name' => '合同会社ケアサポート', 'industry' => '医療・福祉'],
            ['name' => '株式会社グリーンオフィス', 'industry' => 'サービス'],
        ];

        foreach ($companies as $index => $companyData) {
            $i = $index + 1;
            $user = User::firstOrCreate(
                ['email' => "company{$i}@example.com"],
                [
                    'password' => 'password',
                    'role' => 'company',
                    'email_verified_at' => now(),
                ]
            );

            $profile = CompanyProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $companyData['name'],
                    'industry' => $companyData['industry'],
                    'employee_count' => 100 * $i,
                    'prefecture_id' => $i === 2 ? $osaka?->id : $tokyo?->id,
                    'description' => "{$companyData['name']}は障害者雇用に積極的に取り組んでいます。",
                    'disabled_hire_count' => $i * 2,
                    'considerations' => [
                        'facility' => ['バリアフリートイレ', '車椅子対応'],
                        'work_style' => ['時短勤務可', 'テレワーク可'],
                    ],
                ]
            );

            // 各企業に求人を2〜3件作成
            $jobCount = $i === 1 ? 3 : 2;
            for ($j = 1; $j <= $jobCount; $j++) {
                Job::firstOrCreate(
                    ['company_id' => $profile->id, 'title' => "{$companyData['name']} 求人{$j}"],
                    [
                        'job_category_id' => $j === 1 ? $itCategory?->id : $adminCategory?->id,
                        'description' => "障害者雇用枠での募集です。サポート体制が整っています。",
                        'employment_type' => 'full_time',
                        'work_style' => $j === 1 ? 'hybrid' : 'office',
                        'salary_min' => 200000,
                        'salary_max' => 300000,
                        'prefecture_id' => $profile->prefecture_id,
                        'considerations' => $profile->considerations,
                        'status' => 'published',
                    ]
                );
            }
        }
    }
}
