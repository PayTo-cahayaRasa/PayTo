<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PosCheckoutRequest extends FormRequest
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
        $rules = [
            'payment_method' => ['required', 'string', 'in:CASH,EWALLET'],
            'cash_received' => ['required_if:payment_method,CASH', 'numeric', 'min:0'],
            'reference' => ['nullable', 'string', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'numeric', 'min:0.001'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'source' => ['nullable', 'string', 'in:WALK_IN,WHATSAPP'],
            'customer_name' => ['required_if:source,WHATSAPP', 'nullable', 'string', 'max:255'],
            // Updated: Better phone validation (10-15 digits, no regex for fake detection)
            'customer_phone' => [
                'required_if:source,WHATSAPP',
                'nullable',
                'string',
                'min:10',
                'max:15',
                'regex:/^[0-9]+$/',
            ],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'payment_method.required' => 'Metode pembayaran wajib diisi.',
            'payment_method.in' => 'Metode pembayaran tidak valid.',
            'cash_received.required_if' => 'Uang diterima wajib diisi untuk pembayaran tunai.',
            'items.required' => 'Item transaksi wajib diisi.',
            'items.min' => 'Item transaksi tidak boleh kosong.',
            'items.*.product_id.exists' => 'Produk tidak ditemukan.',
            'items.*.qty.min' => 'Jumlah item tidak valid.',
            'items.*.discount_amount.min' => 'Diskon tidak valid.',
            'source.in' => 'Sumber transaksi tidak valid. Gunakan WALK_IN atau WHATSAPP.',
            'customer_name.required_if' => 'Nama pelanggan wajib diisi untuk pesanan WhatsApp.',
            'customer_phone.required_if' => 'Nomor WhatsApp pelanggan wajib diisi.',
            'customer_phone.regex' => 'Nomor WhatsApp harus berupa angka saja tanpa +, spasi, atau tanda hubung.',
            'customer_phone.min' => 'Nomor WhatsApp minimal 10 digit.',
            'customer_phone.max' => 'Nomor WhatsApp maksimal 15 digit.',
        ];
    }
}
