<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    public function create(User $user): bool
    {
        return $user->isJobseeker();
    }

    public function updateStatus(User $user, Application $application): bool
    {
        if (!$user->isCompany()) return false;
        return $user->companyProfile?->id === $application->job?->company_id;
    }
}
