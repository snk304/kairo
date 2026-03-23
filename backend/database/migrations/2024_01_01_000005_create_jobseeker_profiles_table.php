<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobseeker_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('last_name_kana');
            $table->string('first_name_kana');
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->foreignUlid('prefecture_id')->nullable()->constrained();
            $table->foreignUlid('disability_type_id')->nullable()->constrained();
            $table->string('disability_grade')->nullable();
            $table->string('nearest_station')->nullable();
            $table->foreignUlid('desired_job_category_id')->nullable()->constrained('job_categories');
            $table->string('desired_employment_type')->nullable();
            $table->string('desired_work_style')->nullable();
            $table->integer('desired_salary')->nullable();
            $table->text('self_pr')->nullable();
            $table->string('resume_path')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();

            $table->unique('user_id');
            $table->index('is_public');
            $table->index('disability_type_id');
            $table->index('desired_job_category_id');
            $table->index('prefecture_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobseeker_profiles');
    }
};
