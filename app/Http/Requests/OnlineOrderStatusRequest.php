<?php

namespace App\Http\Requests;

use App\Enums\OnlineOrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OnlineOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(OnlineOrderStatus::class)],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ];
    }
}
