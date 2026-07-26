<?php

/**
 * Validates approval actions for supervisor decisions.
 */

namespace App\Http\Requests;

use App\Rules\CurrentUserCredential;
use Illuminate\Foundation\Http\FormRequest;

class ApprovalApproveRequest extends FormRequest
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
            'confirmed' => ['required', 'boolean', 'accepted'],
            'current_credential' => ['required', 'string', new CurrentUserCredential($this->user())],
        ];
    }

    public function messages(): array
    {
        return [
            'confirmed.required' => 'Konfirmasi persetujuan wajib diisi.',
            'confirmed.accepted' => 'Anda harus mengkonfirmasi persetujuan.',
        ];
    }
}
