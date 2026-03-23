<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->foreignUlid('job_category_id')->nullable()->constrained();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('employment_type')->nullable();
            $table->string('work_style')->nullable();
            $table->integer('salary_min')->nullable();
            $table->integer('salary_max')->nullable();
            $table->foreignUlid('prefecture_id')->nullable()->constrained();
            $table->jsonb('considerations')->nullable();
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->timestamps();

            $table->index('company_id');
            $table->index('status');
            $table->index('job_category_id');
            $table->index('prefecture_id');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
