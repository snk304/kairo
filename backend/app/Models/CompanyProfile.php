<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function user() { return $this->belongsTo(User::class); }
    public function prefecture() { return $this->belongsTo(Prefecture::class); }
    public function jobs() { return $this->hasMany(Job::class, 'company_id'); }
}
