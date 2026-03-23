<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'company' => $this->whenLoaded('company', fn() => $this->company ? [
                'id' => $this->company->id,
                'name' => $this->company->name,
            ] : null),
            'jobCategory' => $this->whenLoaded('jobCategory', fn() => $this->jobCategory ? [
                'id' => $this->jobCategory->id,
                'name' => $this->jobCategory->name,
            ] : null),
            'description' => $this->description,
            'employmentType' => $this->employment_type,
            'workStyle' => $this->work_style,
            'salaryMin' => $this->salary_min,
            'salaryMax' => $this->salary_max,
            'prefecture' => $this->whenLoaded('prefecture', fn() => $this->prefecture ? [
                'id' => $this->prefecture->id,
                'name' => $this->prefecture->name,
            ] : null),
            'considerations' => $this->considerations,
            'status' => $this->status,
            'applicationCount' => $this->when(isset($this->applications_count), $this->applications_count),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
