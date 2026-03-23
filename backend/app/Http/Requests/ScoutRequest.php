<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ScoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isCompany();
    }

    public function rules(): array
    {
        return [
            'jobseeker_id' => ['required', Rule::exists('users', 'id')->where('role', 'jobseeker')],
            'job_id' => ['nullable', 'exists:jobs,id'],
            'message' => ['required', 'string', 'max:2000'],
        ];
    }
}
