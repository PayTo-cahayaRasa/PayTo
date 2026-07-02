<?php

namespace App\Http\Requests;

use App\Rules\CurrentUserCredential;
use App\Rules\SecurePin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StaffUpdateRequest extends FormRequest
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
        $user = $this->route('user');
        $userId = is_object($user) ? $user->id : $user;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'username' => ['sometimes', 'required', 'string', 'max:255', 'unique:users,username,'.$userId],
            'role' => ['sometimes', 'required', 'string', 'in:CASHIER,SUPERVISOR'],
            'is_active' => ['sometimes', 'boolean'],
            'password' => ['sometimes', 'nullable', 'string', 'max:255', Password::min(8)->letters()->mixedCase()->numbers()->symbols()],
            'pin' => ['sometimes', 'nullable', 'string', 'digits:6', new SecurePin],
            'current_credential' => [
                Rule::requiredIf(fn (): bool => $this->filled('password') || $this->filled('pin')),
                'nullable',
                'string',
                'max:255',
                new CurrentUserCredential($this->user()),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama staf wajib diisi.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan.',
            'role.in' => 'Role tidak valid.',
            'pin.digits' => 'PIN harus 6 digit.',
            'current_credential.required' => 'Password atau PIN supervisor wajib dikonfirmasi.',
        ];
    }
}
