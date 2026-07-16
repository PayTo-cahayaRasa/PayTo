<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'sku' => ['nullable', 'string', 'max:255', 'unique:products,sku'],
            'barcode' => ['nullable', 'string', 'max:255', 'unique:products,barcode'],
            'price' => ['required', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:2000'],
            'discount' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'uom' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'stock' => ['required', 'numeric', 'min:0'],
            'weight_grams' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama produk wajib diisi.',
            'sku.unique' => 'SKU sudah digunakan.',
            'barcode.unique' => 'Barcode sudah digunakan.',
            'price.required' => 'Harga jual wajib diisi.',
            'price.min' => 'Harga jual tidak valid.',
            'discount.min' => 'Diskon tidak valid.',
            'discount.max' => 'Diskon tidak boleh lebih dari 100%.',
            'cost.min' => 'Harga modal tidak valid.',
            'stock.required' => 'Stok awal wajib diisi.',
            'stock.min' => 'Stok awal tidak valid.',
            'image.image' => 'Foto produk harus berupa gambar.',
            'image.mimes' => 'Foto produk harus berformat JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran foto produk maksimal 4 MB.',
        ];
    }
}
