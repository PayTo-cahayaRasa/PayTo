<?php

namespace App\Services;

use App\Services\Settings\AppSettingsService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class RajaOngkirService
{
    public function __construct(private readonly AppSettingsService $settings) {}

    /**
     * @return array<int, array{id: string, label: string}>
     */
    public function searchDestinations(string $query): array
    {
        if (mb_strlen($query) < 3) {
            return [];
        }

        return Cache::remember('rajaongkir:destination:'.sha1($query), now()->addDays(7), function () use ($query): array {
            $response = $this->request()->get('/destination/domestic-destination', ['search' => $query]);

            if (! $response->successful()) {
                throw ValidationException::withMessages(['destination' => 'Tujuan pengiriman tidak tersedia. Silakan coba lagi.']);
            }

            return collect($response->json('data', []))->map(fn (array $destination): array => [
                'id' => (string) ($destination['id'] ?? ''),
                'label' => implode(', ', array_filter([
                    $destination['subdistrict_name'] ?? null,
                    $destination['district_name'] ?? null,
                    $destination['city_name'] ?? null,
                    $destination['province_name'] ?? null,
                ])),
            ])->filter(fn (array $destination): bool => $destination['id'] !== '')->values()->all();
        });
    }

    /**
     * @return array<int, array{courier_code: string, courier_name: string, service: string, cost: float, etd: string|null}>
     */
    public function quote(string $destination, int $weight, string $courier): array
    {
        $origin = (string) ($this->settings->getOnlineOrderSettings()['shipping']['origin'] ?: config('services.rajaongkir.origin'));
        if ($origin === '' || $weight < 1) {
            throw ValidationException::withMessages(['shipping' => 'Pengaturan pengiriman toko belum lengkap.']);
        }

        $cacheKey = 'rajaongkir:quote:'.sha1("{$origin}:{$destination}:{$weight}:{$courier}");

        return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($destination, $weight, $courier, $origin): array {
            try {
                $response = $this->request()->asForm()->post('/calculate/domestic-cost', [
                    'origin' => $origin,
                    'destination' => $destination,
                    'weight' => $weight,
                    'courier' => $courier,
                ]);
            } catch (ConnectionException) {
                throw ValidationException::withMessages(['shipping' => 'Layanan ongkir sedang tidak dapat dihubungi. Silakan coba lagi atau pilih pickup.']);
            }

            if (! $response->successful()) {
                $message = (string) $response->json('meta.message', 'Tarif pengiriman tidak tersedia.');
                throw ValidationException::withMessages(['shipping' => $message.' Silakan pilih kurir lain atau pickup.']);
            }

            return collect($response->json('data', []))->flatMap(function (array $result) use ($courier): array {
                $services = isset($result['costs']) ? $result['costs'] : [$result];

                return collect($services)->map(fn (array $service): array => [
                    'courier_code' => (string) ($result['code'] ?? $courier),
                    'courier_name' => (string) ($result['name'] ?? strtoupper($courier)),
                    'service' => (string) ($service['service'] ?? ''),
                    'cost' => (float) ($service['cost'] ?? 0),
                    'etd' => isset($service['etd']) ? (string) $service['etd'] : null,
                ])->all();
            })->filter(fn (array $service): bool => $service['service'] !== '' && $service['cost'] >= 0)->values()->all();
        });
    }

    private function request(): \Illuminate\Http\Client\PendingRequest
    {
        $apiKey = (string) config('services.rajaongkir.key');
        if ($apiKey === '') {
            throw ValidationException::withMessages(['shipping' => 'Integrasi ongkir belum dikonfigurasi.']);
        }

        return Http::baseUrl(rtrim((string) config('services.rajaongkir.base_url'), '/'))
            ->acceptJson()
            ->withHeaders(['key' => $apiKey])
            ->timeout(8);
    }
}
