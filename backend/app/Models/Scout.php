<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Scout extends Model
{
    use HasUlids;

    protected $fillable = ['company_id', 'jobseeker_id', 'job_id', 'message', 'status'];

    public function company() { return $this->belongsTo(User::class, 'company_id'); }
    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function job() { return $this->belongsTo(Job::class); }
    public function thread() { return $this->hasOne(Thread::class); }
}
