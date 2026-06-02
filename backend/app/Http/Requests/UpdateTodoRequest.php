<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTodoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|min:2|max:100',
            'description' => 'nullable|string|max:500',
            'status' => 'sometimes|required|in:pending,completed',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Title is required',
            'title.min' => 'Title must be at least 2 characters',
            'title.max' => 'Title must not exceed 100 characters',
            'description.max' => 'Description must not exceed 500 characters',
            'status.in' => 'Status must be either pending or completed',
        ];
    }
}
