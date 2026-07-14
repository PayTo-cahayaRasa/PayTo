<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'rajaongkir' => [
        'key' => env('RAJAONGKIR_API_KEY'),
        'base_url' => env('RAJAONGKIR_BASE_URL', 'https://rajaongkir.komerce.id/api/v1'),
        'origin' => env('RAJAONGKIR_ORIGIN'),
        'couriers' => array_filter(explode(',', env('RAJAONGKIR_COURIERS', 'jne,jnt,sicepat'))),
    ],

    'storefront_payment' => [
        'bank_name' => env('STOREFRONT_BANK_NAME', ''),
        'bank_account_number' => env('STOREFRONT_BANK_ACCOUNT_NUMBER', ''),
        'bank_account_name' => env('STOREFRONT_BANK_ACCOUNT_NAME', ''),
        'qris_image_url' => env('STOREFRONT_QRIS_IMAGE_URL', ''),
        'instructions' => env('STOREFRONT_PAYMENT_INSTRUCTIONS', 'Lakukan pembayaran sesuai total pesanan, lalu kirim bukti pembayaran melalui WhatsApp.'),
    ],

];
