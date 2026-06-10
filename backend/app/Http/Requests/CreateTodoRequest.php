<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTodoRequest extends FormRequest
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
            'title'          => 'required|string|min:3|max:255',
            'description'    => 'nullable|string|max:1000',
            'startDateTime'  => 'nullable|date',
            'images'         => 'nullable|array|max:5',
            'images.*'       => 'image|mimes:jpeg,png,webp,gif|max:5120', // 5 MB each
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
            'title.required'    => 'Title is required',
            'title.string'      => 'Title must be a string',
            'title.min'         => 'Title must be at least 3 characters',
            'title.max'         => 'Title must not exceed 255 characters',
            'description.string' => 'Description must be a string',
            'description.max'   => 'Description must not exceed 1000 characters',
            'startDateTime.date' => 'Start date and time must be a valid date',
            'images.array'      => 'Images must be an array',
            'images.max'        => 'You may upload a maximum of 5 images',
            'images.*.image'    => 'Each attachment must be an image file',
            'images.*.mimes'    => 'Images must be JPEG, PNG, WEBP, or GIF',
            'images.*.max'      => 'Each image must not exceed 5 MB',
        ];
    }
}
