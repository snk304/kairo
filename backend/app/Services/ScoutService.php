<?php

namespace App\Services;

use App\Models\Message;
use App\Models\Notification;
use App\Models\Scout;
use App\Models\User;

class ScoutService
{
    public function __construct(private ThreadService $threadService) {}

    public function send(User $company, array $data): Scout
    {
        $scout = Scout::create([
            'company_id' => $company->id,
            'jobseeker_id' => $data['jobseeker_id'],
            'job_id' => $data['job_id'] ?? null,
            'message' => $data['message'],
            'status' => 'unread',
        ]);

        Notification::create([
            'user_id' => $data['jobseeker_id'],
            'type' => 'scout_received',
            'data' => ['scout_id' => $scout->id],
        ]);

        return $scout;
    }

    public function reply(Scout $scout, string $message): Scout
    {
        $scout->update(['status' => 'replied']);

        $thread = $this->threadService->findOrCreateByScout($scout);

        Message::create([
            'thread_id' => $thread->id,
            'sender_id' => $scout->jobseeker_id,
            'body' => $message,
        ]);

        Notification::create([
            'user_id' => $scout->company_id,
            'type' => 'scout_replied',
            'data' => ['scout_id' => $scout->id],
        ]);

        return $scout;
    }
}
