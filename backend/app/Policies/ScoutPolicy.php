<?php

namespace App\Policies;

use App\Models\Scout;
use App\Models\User;

class ScoutPolicy
{
    public function create(User $user): bool
    {
        return $user->isCompany();
    }

    public function view(User $user, Scout $scout): bool
    {
        return $user->id === $scout->jobseeker_id
            || $user->id === $scout->company_id;
    }
}
