<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCompany();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:100'],
            'job_category_id' => ['nullable', 'exists:job_categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'employment_type' => ['nullable', 'in:full_time,part_time,contract,dispatch'],
            'work_style' => ['nullable', 'in:office,remote,hybrid'],
            'salary_min' => ['nullable', 'integer', 'min:0'],
            'salary_max' => ['nullable', 'integer', 'min:0', 'gte:salary_min'],
            'prefecture_id' => ['nullable', 'exists:prefectures,id'],
            'considerations' => ['nullable', 'array'],
            'considerations.facility' => ['nullable', 'array'],
            'considerations.work_style' => ['nullable', 'array'],
            'considerations.communication' => ['nullable', 'array'],
            'considerations.equipment' => ['nullable', 'array'],
            'status' => ['in:draft,published,closed'],
        ];
    }
}
