<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobseekerProfile extends Model
{
    use HasUlids, HasFactory;

    protected $fillable = [
        'user_id', 'last_name', 'first_name', 'last_name_kana', 'first_name_kana',
        'birth_date', 'gender', 'prefecture_id', 'disability_type_id', 'disability_grade',
        'nearest_station', 'desired_job_category_id', 'desired_employment_type',
        'desired_work_style', 'desired_salary', 'self_pr', 'resume_path', 'is_public',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_public' => 'boolean',
        'desired_salary' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prefecture(): BelongsTo
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function disabilityType(): BelongsTo
    {
        return $this->belongsTo(DisabilityType::class);
    }

    public function desiredJobCategory(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'desired_job_category_id');
    }

    /** @param \Illuminate\Database\Eloquent\Builder<JobseekerProfile> $query */
    public function scopePublic($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_public', true);
    }
}
