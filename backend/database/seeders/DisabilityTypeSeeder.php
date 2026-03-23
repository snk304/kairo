<?php

namespace Database\Seeders;

use App\Models\DisabilityType;
use Illuminate\Database\Seeder;

class DisabilityTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            '視覚障害',
            '聴覚障害・平衡機能障害',
            '音声・言語・そしゃく機能障害',
            '肢体不自由',
            '内部障害（心臓・腎臓・呼吸器など）',
        ];

        foreach ($types as $name) {
            DisabilityType::firstOrCreate(['name' => $name]);
        }
    }
}
