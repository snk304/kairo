<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('job_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['applied', 'screening', 'interview', 'offered', 'rejected'])
                  ->default('applied');
            $table->timestamps();

            $table->unique(['job_id', 'jobseeker_id']);
            $table->index('job_id');
            $table->index('jobseeker_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
