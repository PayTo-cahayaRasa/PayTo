<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class SecurePin implements ValidationRule
{
    /**
     * @var list<string>
     */
    private const SEQUENTIAL_PINS = [
        '012345',
        '123456',
        '234567',
        '345678',
        '456789',
        '987654',
        '876543',
        '765432',
        '654321',
        '543210',
    ];

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        $isRepeatedDigit = preg_match('/^(\d)\1{5}$/', $value) === 1;

        if ($isRepeatedDigit || in_array($value, self::SEQUENTIAL_PINS, true)) {
            $fail('PIN terlalu mudah ditebak. Gunakan kombinasi 6 digit yang tidak berulang atau berurutan.');
        }
    }
}
