<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('threads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('jobseeker_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('company_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('application_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('scout_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index('jobseeker_id');
            $table->index('company_id');
            $table->index('application_id');
            $table->index('scout_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('threads');
    }
};
