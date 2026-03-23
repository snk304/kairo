<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scouts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('company_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('job_id')->nullable()->constrained()->nullOnDelete();
            $table->text('message');
            $table->enum('status', ['unread', 'read', 'replied'])->default('unread');
            $table->timestamps();

            $table->index('company_id');
            $table->index('jobseeker_id');
            $table->index(['company_id', 'jobseeker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scouts');
    }
};
