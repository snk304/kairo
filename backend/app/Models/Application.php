<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasUlids, HasFactory;

    protected $fillable = ['job_id', 'jobseeker_id', 'status'];

    public function job() { return $this->belongsTo(Job::class); }
    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function thread() { return $this->hasOne(Thread::class); }
}
