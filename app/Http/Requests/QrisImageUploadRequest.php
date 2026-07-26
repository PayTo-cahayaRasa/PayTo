<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QrisImageUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'qris_image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'qris_image.required' => 'Gambar QRIS wajib dipilih.',
            'qris_image.image' => 'File QRIS harus berupa gambar.',
            'qris_image.mimes' => 'Gambar QRIS harus berformat JPG, PNG, atau WEBP.',
            'qris_image.max' => 'Ukuran gambar QRIS maksimal 4 MB.',
        ];
    }
}
