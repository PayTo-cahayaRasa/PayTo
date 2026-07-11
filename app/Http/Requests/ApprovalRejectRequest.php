<?php

/**
 * Validates rejection payloads for supervisor decisions.
 */

namespace App\Http\Requests;

use App\Rules\CurrentUserCredential;
use Illuminate\Foundation\Http\FormRequest;

class ApprovalRejectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:255'],
            'current_credential' => ['required', 'string', new CurrentUserCredential($this->user())],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan penolakan wajib diisi.',
            'reason.min' => 'Alasan penolakan minimal 5 karakter.',
        ];
    }
}
