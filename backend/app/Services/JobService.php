<?php

namespace App\Services;

use App\Models\Job;
use App\Models\User;

class JobService
{
    public function create(User $user, array $data): Job
    {
        $profile = $user->companyProfile;

        return $profile->jobs()->create($data);
    }

    public function update(Job $job, array $data): Job
    {
        $job->update($data);

        return $job->load(['company', 'jobCategory', 'prefecture']);
    }

    public function updateStatus(Job $job, string $status): Job
    {
        $job->update(['status' => $status]);

        return $job;
    }

    public function delete(Job $job): void
    {
        $job->delete();
    }
}
