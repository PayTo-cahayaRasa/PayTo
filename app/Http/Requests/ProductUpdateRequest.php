<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductUpdateRequest extends FormRequest
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
        $product = $this->route('product');
        $productId = is_object($product) ? $product->id : $product;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:products,slug,'.$productId],
            'sku' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:products,sku,'.$productId],
            'barcode' => ['sometimes', 'nullable', 'string', 'max:255', 'unique:products,barcode,'.$productId],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'discount' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:100'],
            'cost' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'uom' => ['sometimes', 'nullable', 'string', 'max:50'],
            'category' => ['sometimes', 'required', 'in:Makanan,Camilan,Minuman,Kerajinan,Lainnya'],
            'is_active' => ['sometimes', 'boolean'],
            'is_public' => ['sometimes', 'boolean'],
            'featured' => ['sometimes', 'boolean'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'stock' => ['sometimes', 'required', 'numeric', 'min:0'],
            'weight_grams' => ['sometimes', 'nullable', 'integer', 'min:1'],
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
            'stock.required' => 'Stok wajib diisi.',
            'stock.min' => 'Stok tidak valid.',
            'image.image' => 'Foto produk harus berupa gambar.',
            'image.mimes' => 'Foto produk harus berformat JPG, PNG, atau WEBP.',
            'image.max' => 'Ukuran foto produk maksimal 4 MB.',
        ];
    }
}
