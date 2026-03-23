<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('industry')->nullable();
            $table->integer('employee_count')->nullable();
            $table->foreignUlid('prefecture_id')->nullable()->constrained();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->integer('disabled_hire_count')->default(0);
            $table->jsonb('considerations')->nullable();
            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_profiles');
    }
};
