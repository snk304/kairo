<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class JobseekerProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isCompany = $user && $user->isCompany();

        $data = [
            'id' => $this->id,
            'userId' => $this->user_id,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'disabilityType' => $this->whenLoaded('disabilityType', fn() => $this->disabilityType ? [
                'id' => $this->disabilityType->id,
                'name' => $this->disabilityType->name,
            ] : null),
            'disabilityGrade' => $this->disability_grade,
            'desiredJobCategory' => $this->whenLoaded('desiredJobCategory', fn() => $this->desiredJobCategory ? [
                'id' => $this->desiredJobCategory->id,
                'name' => $this->desiredJobCategory->name,
            ] : null),
            'prefecture' => $this->whenLoaded('prefecture', fn() => $this->prefecture ? [
                'id' => $this->prefecture->id,
                'name' => $this->prefecture->name,
            ] : null),
            'desiredWorkStyle' => $this->desired_work_style,
            'desiredEmploymentType' => $this->desired_employment_type,
            'desiredSalary' => $this->desired_salary,
            'selfPr' => $this->self_pr,
            'isPublic' => $this->is_public,
        ];

        if ($isCompany) {
            $data['email'] = $this->user->email;
            $data['resumeUrl'] = $this->resume_path
                ? Storage::url($this->resume_path)
                : null;
        }

        return $data;
    }
}
