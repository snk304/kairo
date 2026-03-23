<?php

namespace App\Http\Resources;

use App\Models\Thread;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property Thread $resource */
class ThreadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()->id;
        $isJobseeker = $request->user()->isJobseeker();
        $opponent = $isJobseeker ? $this->company : $this->jobseeker;
        $opponentProfile = $isJobseeker
            ? $opponent?->companyProfile
            : $opponent?->jobseekerProfile;

        return [
            'id' => $this->id,
            'opponent' => [
                'id' => $opponent?->id,
                'name' => $isJobseeker
                    ? $opponentProfile?->name
                    : ($opponentProfile ? $opponentProfile->last_name . $opponentProfile->first_name : null),
            ],
            'lastMessage' => $this->whenLoaded('latestMessage', fn() => $this->latestMessage ? [
                'body' => $this->latestMessage->body,
                'createdAt' => $this->latestMessage->created_at?->toISOString(),
            ] : null),
            'unreadCount' => $this->resource->unreadCount($userId),
        ];
    }
}
