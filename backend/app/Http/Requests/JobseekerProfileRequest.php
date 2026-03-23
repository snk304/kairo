<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobseekerProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isJobseeker();
    }

    public function rules(): array
    {
        return [
            'last_name' => ['required', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:50'],
            'last_name_kana' => ['required', 'string', 'max:50', 'regex:/^[ァ-ヶー]+$/u'],
            'first_name_kana' => ['required', 'string', 'max:50', 'regex:/^[ァ-ヶー]+$/u'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'prefecture_id' => ['nullable', 'exists:prefectures,id'],
            'disability_type_id' => ['nullable', 'exists:disability_types,id'],
            'disability_grade' => ['nullable', 'string', 'max:20'],
            'nearest_station' => ['nullable', 'string', 'max:100'],
            'desired_job_category_id' => ['nullable', 'exists:job_categories,id'],
            'desired_employment_type' => ['nullable', 'in:general,special_subsidiary,support'],
            'desired_work_style' => ['nullable', 'in:full_time,part_time,remote,hybrid'],
            'desired_salary' => ['nullable', 'integer', 'min:0'],
            'self_pr' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['boolean'],
        ];
    }
}
