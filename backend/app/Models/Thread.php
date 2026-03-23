<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Thread extends Model
{
    use HasUlids, HasFactory;

    protected $fillable = ['jobseeker_id', 'company_id', 'application_id', 'scout_id'];

    public function jobseeker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jobseeker_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(User::class, 'company_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function unreadCount(string $userId): int
    {
        return $this->messages()->where('is_read', false)->where('sender_id', '!=', $userId)->count();
    }
}
