<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasUlids, HasFactory;

    protected $fillable = ['job_id', 'jobseeker_id', 'status'];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function jobseeker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jobseeker_id');
    }

    public function thread(): HasOne
    {
        return $this->hasOne(Thread::class);
    }
}
