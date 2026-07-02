<?php

namespace App\Http\Requests;

use App\Rules\CurrentUserCredential;
use App\Rules\SecurePin;
use Illuminate\Foundation\Http\FormRequest;

class StaffResetPinRequest extends FormRequest
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
            'pin' => ['required', 'string', 'digits:6', new SecurePin],
            'current_credential' => ['required', 'string', 'max:255', new CurrentUserCredential($this->user())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'pin.required' => 'PIN wajib diisi.',
            'pin.digits' => 'PIN harus 6 digit.',
            'current_credential.required' => 'Password atau PIN supervisor wajib dikonfirmasi.',
        ];
    }
}
