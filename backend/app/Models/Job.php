<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Job extends Model
{
    use HasUlids, HasFactory, Searchable;

    protected $fillable = [
        'company_id', 'job_category_id', 'title', 'description',
        'employment_type', 'work_style', 'salary_min', 'salary_max',
        'prefecture_id', 'considerations', 'status',
    ];

    protected $casts = [
        'considerations' => 'array',
        'salary_min' => 'integer',
        'salary_max' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function jobCategory(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class);
    }

    public function prefecture(): BelongsTo
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /** @param \Illuminate\Database\Eloquent\Builder<Job> $query */
    public function scopePublished($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('status', 'published');
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'employment_type' => $this->employment_type,
            'work_style' => $this->work_style,
            'status' => $this->status,
        ];
    }
}
