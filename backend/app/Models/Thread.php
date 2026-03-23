<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Thread extends Model
{
    use HasUlids;

    protected $fillable = ['jobseeker_id', 'company_id', 'application_id', 'scout_id'];

    public function jobseeker() { return $this->belongsTo(User::class, 'jobseeker_id'); }
    public function company() { return $this->belongsTo(User::class, 'company_id'); }
    public function messages() { return $this->hasMany(Message::class)->orderBy('created_at'); }
    public function latestMessage() { return $this->hasOne(Message::class)->latestOfMany(); }

    public function unreadCount(string $userId): int
    {
        return $this->messages()->where('is_read', false)->where('sender_id', '!=', $userId)->count();
    }
}
