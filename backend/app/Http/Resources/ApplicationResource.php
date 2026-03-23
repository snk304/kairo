<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job' => $this->whenLoaded('job', fn() => $this->job ? [
                'id' => $this->job->id,
                'title' => $this->job->title,
                'company' => $this->job->company ? [
                    'id' => $this->job->company->id,
                    'name' => $this->job->company->name,
                ] : null,
            ] : null),
            'jobseeker' => $this->whenLoaded('jobseeker', fn() => $this->jobseeker ? new UserResource($this->jobseeker) : null),
            'status' => $this->status,
            'threadId' => $this->whenLoaded('thread', fn() => $this->thread?->id),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
