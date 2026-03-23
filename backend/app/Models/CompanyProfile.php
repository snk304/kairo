<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanyProfile extends Model
{
    use HasUlids, HasFactory;

    protected $fillable = [
        'user_id', 'name', 'industry', 'employee_count', 'prefecture_id',
        'address', 'description', 'disabled_hire_count', 'considerations',
    ];

    protected $casts = [
        'considerations' => 'array',
        'employee_count' => 'integer',
        'disabled_hire_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prefecture(): BelongsTo
    {
        return $this->belongsTo(Prefecture::class);
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'company_id');
    }
}
