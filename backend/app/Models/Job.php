<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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

    public function company() { return $this->belongsTo(CompanyProfile::class, 'company_id'); }
    public function jobCategory() { return $this->belongsTo(JobCategory::class); }
    public function prefecture() { return $this->belongsTo(Prefecture::class); }
    public function applications() { return $this->hasMany(Application::class); }

    public function scopePublished($query) { return $query->where('status', 'published'); }

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
