<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterMerchantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:merchants,email'],
            'password' => ['required', 'string', 'min:8'],
            'webhook_url' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
