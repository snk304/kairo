<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Scout;
use App\Models\Thread;

class ThreadService
{
    public function findOrCreateByScout(Scout $scout): Thread
    {
        return Thread::firstOrCreate(
            ['scout_id' => $scout->id],
            [
                'jobseeker_id' => $scout->jobseeker_id,
                'company_id' => $scout->company_id,
            ]
        );
    }

    public function findOrCreateByApplication(Application $application): Thread
    {
        return Thread::firstOrCreate(
            ['application_id' => $application->id],
            [
                'jobseeker_id' => $application->jobseeker_id,
                'company_id' => $application->job->company->user_id,
            ]
        );
    }
}
