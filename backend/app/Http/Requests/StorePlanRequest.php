<?php

namespace App\Http\Requests;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
            'required',
            'string',
            'max:255',
            Rule::unique('plans')->where(function ($query) {
                return $query->where('merchant_id', auth()->id());
            }),
        ],
            'description' => ['nullable', 'string'],
            // Amount is in kobo (integer). The frontend converts naira -> kobo before sending.
            'amount' => ['required', 'integer', 'min:1'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'interval' => ['required', 'in:weekly,monthly,annual,custom'],
            'interval_count' => ['sometimes', 'integer', 'min:1'],
            'trial_days' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
