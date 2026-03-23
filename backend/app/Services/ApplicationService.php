<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Job;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ApplicationService
{
    public function __construct(private ThreadService $threadService) {}

    public function apply(Job $job, User $jobseeker): Application
    {
        $existing = Application::where('job_id', $job->id)
            ->where('jobseeker_id', $jobseeker->id)
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'job_id' => ['すでにこの求人に応募済みです。'],
            ]);
        }

        $application = Application::create([
            'job_id' => $job->id,
            'jobseeker_id' => $jobseeker->id,
            'status' => 'applied',
        ]);

        $this->threadService->findOrCreateByApplication($application);

        // 企業に通知
        Notification::create([
            'user_id' => $job->company->user_id,
            'type' => 'application_received',
            'data' => [
                'application_id' => $application->id,
                'job_title' => $job->title,
            ],
        ]);

        return $application;
    }

    public function updateStatus(Application $application, string $status): Application
    {
        $application->update(['status' => $status]);

        // 求職者に通知
        Notification::create([
            'user_id' => $application->jobseeker_id,
            'type' => 'application_status_changed',
            'data' => [
                'application_id' => $application->id,
                'status' => $status,
            ],
        ]);

        return $application;
    }
}
