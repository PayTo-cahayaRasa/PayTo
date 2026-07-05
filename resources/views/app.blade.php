<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'PayTo') }}</title>
    <link rel="icon" type="image/png" href="{{ asset('storage/logs-removed.png') }}">
    <link rel="shortcut icon" href="{{ asset('storage/logs-removed.png') }}">

    @inertiaHead

    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>

<body class="antialiased">
    @inertia
</body>

</html>
