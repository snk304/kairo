<?php

namespace App\Policies;

use App\Models\Thread;
use App\Models\User;

class ThreadPolicy
{
    public function view(User $user, Thread $thread): bool
    {
        return $thread->jobseeker_id === $user->id || $thread->company_id === $user->id;
    }
}
