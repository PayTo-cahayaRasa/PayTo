<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Hash;

class CurrentUserCredential implements ValidationRule
{
    public function __construct(private readonly ?Authenticatable $user) {}

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! $this->user instanceof User) {
            $fail('Kredensial supervisor tidak valid.');

            return;
        }

        $matchesPassword = is_string($this->user->password_hash)
            && Hash::check($value, $this->user->password_hash);
        $matchesPin = is_string($this->user->pin_hash)
            && Hash::check($value, $this->user->pin_hash);

        if (! $matchesPassword && ! $matchesPin) {
            $fail('Kredensial supervisor tidak valid.');
        }
    }
}
