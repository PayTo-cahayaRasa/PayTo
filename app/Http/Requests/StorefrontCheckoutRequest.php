<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorefrontCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'idempotency_key' => ['required', 'uuid'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'regex:/^[0-9]{10,15}$/'],
            'fulfillment_method' => ['required', Rule::in(['DELIVERY', 'PICKUP'])],
            'shipping_address' => ['required_if:fulfillment_method,DELIVERY', 'nullable', 'string', 'max:1000'],
            'destination_id' => ['required_if:fulfillment_method,DELIVERY', 'nullable', 'string', 'max:100'],
            'destination_label' => ['required_if:fulfillment_method,DELIVERY', 'nullable', 'string', 'max:255'],
            'shipping_courier_code' => ['required_if:fulfillment_method,DELIVERY', 'nullable', 'string', 'max:50'],
            'shipping_service' => ['required_if:fulfillment_method,DELIVERY', 'nullable', 'string', 'max:100'],
            'payment_method' => ['required', Rule::in(['BANK_TRANSFER', 'QRIS_MANUAL', 'PAY_AT_STORE'])],
            'customer_note' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }

    public function after(): array
    {
        return [function ($validator): void {
            if ($this->input('fulfillment_method') === 'DELIVERY' && $this->input('payment_method') === 'PAY_AT_STORE') {
                $validator->errors()->add('payment_method', 'Bayar di toko hanya tersedia untuk pesanan pickup.');
            }
        }];
    }
}
