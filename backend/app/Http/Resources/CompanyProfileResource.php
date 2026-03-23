<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CompanyProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'industry' => $this->industry,
            'employeeCount' => $this->employee_count,
            'prefecture' => $this->whenLoaded('prefecture', fn() => $this->prefecture ? [
                'id' => $this->prefecture->id,
                'name' => $this->prefecture->name,
            ] : null),
            'address' => $this->address,
            'description' => $this->description,
            'disabledHireCount' => $this->disabled_hire_count,
            'considerations' => $this->considerations,
        ];
    }
}
