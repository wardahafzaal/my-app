<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $studentId = $this->route('student') 
            ? $this->route('student')->id 
            : optional(auth()->user()->student)->id;

        return [
            'full_name' => ['required', 'string', 'max:255'],
            'cnic_bform' => [
                'required',
                'string',
                'max:25',
                Rule::unique('students', 'cnic_bform')->ignore($studentId),
            ],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:25'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'address' => ['required', 'string', 'max:500'],
            'previous_institution' => ['required', 'string', 'max:255'],
            'qualification' => ['required', 'string', 'max:255'],
            'total_marks' => ['required', 'numeric', 'min:1', 'max:10000'],
            'obtained_marks' => ['required', 'numeric', 'min:0', 'lte:total_marks'],
            'marks_grade' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'cnic_bform.unique' => 'A student profile with this CNIC/B-Form number already exists. Please verify your CNIC/B-Form details.',
            'cnic_bform.required' => 'CNIC/B-Form number is required.',
            'obtained_marks.lte' => 'Obtained marks cannot be greater than total marks.',
            'date_of_birth.before' => 'Date of birth must be a past date.',
        ];
    }
}
