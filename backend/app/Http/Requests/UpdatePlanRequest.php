<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['sometimes', 'integer', 'min:1'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'interval' => ['sometimes', 'in:weekly,monthly,annual,custom'],
            'interval_count' => ['sometimes', 'integer', 'min:1'],
            'trial_days' => ['sometimes', 'integer', 'min:0'],
            // DELETE archives via status=archived; there is no hard delete.
            'status' => ['sometimes', 'in:active,archived'],
        ];
    }
}
