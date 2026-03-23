<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasUlids;

    public $timestamps = false;

    protected $fillable = ['user_id', 'name', 'email', 'body'];

    protected $casts = [
        'created_at' => 'datetime',
    ];
}
