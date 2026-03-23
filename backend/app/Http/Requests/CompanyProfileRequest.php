<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CompanyProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCompany();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'industry' => ['nullable', 'string', 'max:100'],
            'employee_count' => ['nullable', 'integer', 'min:1'],
            'prefecture_id' => ['nullable', 'exists:prefectures,id'],
            'address' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'disabled_hire_count' => ['nullable', 'integer', 'min:0'],
            'considerations' => ['nullable', 'array'],
            'considerations.facility' => ['nullable', 'array'],
            'considerations.work_style' => ['nullable', 'array'],
            'considerations.communication' => ['nullable', 'array'],
            'considerations.equipment' => ['nullable', 'array'],
        ];
    }
}
