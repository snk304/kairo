<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $fillable = ['thread_id', 'sender_id', 'body', 'is_read'];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function thread() { return $this->belongsTo(Thread::class); }
    public function sender() { return $this->belongsTo(User::class, 'sender_id'); }
}
