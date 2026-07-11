<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BusinessSettingsRequest extends FormRequest
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
            // Business profile
            'business.name' => ['required', 'string', 'max:255'],
            'business.address' => ['required', 'string', 'max:500'],
            'business.whatsapp_number' => ['nullable', 'string', 'regex:/^[0-9]{8,15}$/'],
            'business.operating_hours' => ['required', 'string', 'max:255'],
            'business.tagline' => ['nullable', 'string', 'max:120'],
            'business.instagram_url' => ['nullable', 'url', 'max:255'],
            'business.tiktok_url' => ['nullable', 'url', 'max:255'],

            // Catalog settings
            'catalog.enabled' => ['required', 'boolean'],
            'catalog.whatsapp_enabled' => ['required', 'boolean'],
            'catalog.whatsapp_message_template' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'business.name' => 'nama toko',
            'business.address' => 'alamat toko',
            'business.whatsapp_number' => 'nomor WhatsApp',
            'business.operating_hours' => 'jam operasional',
            'business.tagline' => 'tagline toko',
            'business.instagram_url' => 'tautan Instagram',
            'business.tiktok_url' => 'tautan TikTok',
            'catalog.enabled' => 'status katalog',
            'catalog.whatsapp_enabled' => 'status WhatsApp katalog',
            'catalog.whatsapp_message_template' => 'template pesan WhatsApp',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'business.name.required' => 'Nama toko wajib diisi.',
            'business.name.max' => 'Nama toko maksimal 255 karakter.',
            'business.address.required' => 'Alamat toko wajib diisi.',
            'business.address.max' => 'Alamat toko maksimal 500 karakter.',
            'business.whatsapp_number.regex' => 'Nomor WhatsApp harus berupa 8-15 digit angka (format internasional tanpa +, spasi, atau tanda hubung). Contoh: 6281234567890',
            'business.operating_hours.required' => 'Jam operasional wajib diisi.',
            'business.operating_hours.max' => 'Jam operasional maksimal 255 karakter.',
            'business.instagram_url.url' => 'Tautan Instagram harus berupa URL valid.',
            'business.tiktok_url.url' => 'Tautan TikTok harus berupa URL valid.',
            'catalog.enabled.required' => 'Status katalog wajib diisi.',
            'catalog.enabled.boolean' => 'Status katalog harus berupa true atau false.',
            'catalog.whatsapp_enabled.required' => 'Status WhatsApp katalog wajib diisi.',
            'catalog.whatsapp_enabled.boolean' => 'Status WhatsApp katalog harus berupa true atau false.',
            'catalog.whatsapp_message_template.required' => 'Template pesan WhatsApp wajib diisi.',
            'catalog.whatsapp_message_template.max' => 'Template pesan WhatsApp maksimal 500 karakter.',
        ];
    }

    /**
     * Validate WhatsApp template placeholders
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $template = $this->input('catalog.whatsapp_message_template', '');
            $allowedPlaceholders = ['{product_name}', '{price}', '{qty}'];

            // Extract all placeholders from template
            preg_match_all('/\{([^}]+)\}/', $template, $matches);
            $foundPlaceholders = $matches[0] ?? [];

            foreach ($foundPlaceholders as $placeholder) {
                if (! in_array($placeholder, $allowedPlaceholders, true)) {
                    $validator->errors()->add(
                        'catalog.whatsapp_message_template',
                        "Placeholder {$placeholder} tidak diizinkan. Hanya {product_name}, {price}, dan {qty} yang dapat digunakan."
                    );
                }
            }
        });
    }
}
