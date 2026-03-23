<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScoutResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company' => $this->whenLoaded('company', fn() => $this->company?->companyProfile ? [
                'id' => $this->company->companyProfile->id,
                'userId' => $this->company->id,
                'name' => $this->company->companyProfile->name,
            ] : null),
            'jobseeker' => $this->whenLoaded('jobseeker', fn() => $this->jobseeker?->jobseekerProfile ? [
                'id' => $this->jobseeker->jobseekerProfile->id,
                'userId' => $this->jobseeker->id,
                'firstName' => $this->jobseeker->jobseekerProfile->first_name,
                'lastName' => $this->jobseeker->jobseekerProfile->last_name,
            ] : null),
            'job' => $this->whenLoaded('job', fn() => $this->job ? [
                'id' => $this->job->id,
                'title' => $this->job->title,
            ] : null),
            'message' => $this->message,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
