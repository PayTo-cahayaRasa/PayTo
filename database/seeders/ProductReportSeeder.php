<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductReportSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $user = User::first();

        if (! $user) {
            $user = User::factory()->create([
                'name' => 'Report User',
                'username' => 'reports',
            ]);
        }

        $products = [
            'espresso' => [
                'name' => 'Single Origin Espresso',
                'sku' => 'COF-ESP-001',
                'barcode' => '810000000001',
                'price' => 45000,
                'cost' => 14000,
                'uom' => 'cup',
                'is_active' => true,
            ],
            'cappuccino' => [
                'name' => 'Velvet Cappuccino',
                'sku' => 'COF-CAP-001',
                'barcode' => '810000000002',
                'price' => 52000,
                'cost' => 19000,
                'uom' => 'cup',
                'is_active' => true,
            ],
            'latte' => [
                'name' => 'Honey Almond Latte',
                'sku' => 'COF-LAT-001',
                'barcode' => '810000000003',
                'price' => 50000,
                'cost' => 18000,
                'uom' => 'cup',
                'is_active' => true,
            ],
        ];

        $timestamps = collect(array_keys($products))->mapWithKeys(function (string $key, int $index) use ($now): array {
            return [$key => $now->copy()->subMinutes(4 * $index)];
        });

        $productIds = [];
        foreach ($products as $key => $fields) {
            $timestamp = $timestamps[$key];
            DB::table('products')->updateOrInsert(
                ['sku' => $fields['sku']],
                array_merge($fields, [
                    'slug' => Str::slug($fields['name']),
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ])
            );
            $productIds[$key] = (int) DB::table('products')->where('sku', $fields['sku'])->value('id');
        }

        $stockLevels = [
            'espresso' => 120,
            'cappuccino' => 85,
            'latte' => 78,
        ];

        $stockOffset = 10;
        foreach ($stockLevels as $key => $level) {
            DB::table('stock_items')->updateOrInsert(
                ['product_id' => $productIds[$key]],
                [
                    'on_hand' => $level,
                    'created_at' => $now->copy()->subMinutes($stockOffset),
                    'updated_at' => $now->copy()->subMinutes($stockOffset - 1),
                ]
            );
            $stockOffset += 3;
        }

        $saleBase = $now->copy()->subHours(2);
        $saleSpecs = [
            'morningRush' => [
                'server_invoice_no' => 'INV-20260127-0001',
                'local_txn_uuid' => Str::uuid()->toString(),
                'status' => 'PAID',
                'subtotal' => 142000,
                'discount_total' => 2000,
                'tax_total' => 10600,
                'grand_total' => 150600,
                'paid_total' => 150600,
                'change_total' => 0,
                'occurred_at' => $saleBase->copy()->subHours(1),
                'synced_at' => $saleBase->copy()->subMinutes(55),
            ],
            'lunchDraft' => [
                'server_invoice_no' => 'INV-20260127-0002',
                'local_txn_uuid' => Str::uuid()->toString(),
                'status' => 'PENDING_PAYMENT',
                'subtotal' => 50000,
                'discount_total' => 3000,
                'tax_total' => 2000,
                'grand_total' => 49000,
                'paid_total' => 20000,
                'change_total' => 0,
                'occurred_at' => $saleBase->copy()->subMinutes(15),
                'synced_at' => null,
            ],
        ];

        $saleIds = [];
        foreach ($saleSpecs as $key => $spec) {
            $createdAt = $spec['occurred_at']->copy()->subMinutes(2);
            $payload = array_merge($spec, [
                'cashier_id' => $user->id,
                'created_at' => $createdAt,
                'updated_at' => $spec['occurred_at']->copy(),
            ]);
            DB::table('sales')->updateOrInsert(
                ['local_txn_uuid' => $spec['local_txn_uuid']],
                $payload
            );
            $saleIds[$key] = (int) DB::table('sales')->where('local_txn_uuid', $spec['local_txn_uuid'])->value('id');
        }

        DB::table('sale_items')->whereIn('sale_id', array_values($saleIds))->delete();
        $saleItemsBySale = [
            'morningRush' => [
                [
                    'product' => 'espresso',
                    'qty' => 2,
                    'unit_price' => 45000,
                    'discount_amount' => 0,
                ],
                [
                    'product' => 'cappuccino',
                    'qty' => 1,
                    'unit_price' => 52000,
                    'discount_amount' => 2000,
                ],
            ],
            'lunchDraft' => [
                [
                    'product' => 'latte',
                    'qty' => 1,
                    'unit_price' => 50000,
                    'discount_amount' => 3000,
                ],
            ],
        ];

        $saleItemRows = [];
        foreach ($saleIds as $saleKey => $saleId) {
            foreach ($saleItemsBySale[$saleKey] as $item) {
                $lineTotal = ($item['qty'] * $item['unit_price']) - $item['discount_amount'];
                $saleItemRows[] = [
                    'sale_id' => $saleId,
                    'product_id' => $productIds[$item['product']],
                    'product_name_snapshot' => $products[$item['product']]['name'],
                    'unit_price' => $item['unit_price'],
                    'qty' => $item['qty'],
                    'discount_amount' => $item['discount_amount'],
                    'line_total' => $lineTotal,
                    'created_at' => $now->copy()->subMinutes(4),
                    'updated_at' => $now->copy()->subMinutes(3),
                ];
            }
        }
        DB::table('sale_items')->insert($saleItemRows);

        DB::table('payments')->whereIn('sale_id', array_values($saleIds))->delete();
        $paymentRows = [
            [
                'sale_id' => $saleIds['morningRush'],
                'method' => 'CASH',
                'amount' => 150600,
                'reference' => null,
                'status' => 'RECORDED',
                'created_at' => $now->copy()->subMinutes(3),
                'updated_at' => $now->copy()->subMinutes(2),
            ],
            [
                'sale_id' => $saleIds['lunchDraft'],
                'method' => 'EWALLET',
                'amount' => 20000,
                'reference' => 'EWALLET-DEP-20260127',
                'status' => 'RECORDED',
                'created_at' => $now->copy()->subMinutes(2),
                'updated_at' => $now->copy()->subMinute(),
            ],
        ];
        DB::table('payments')->insert($paymentRows);

        DB::table('approvals')->whereIn('sale_id', array_values($saleIds))->delete();
        DB::table('approvals')->insert([
            [
                'action' => 'DISCOUNT_OVERRIDE',
                'sale_id' => $saleIds['lunchDraft'],
                'requested_by' => $user->id,
                'approved_by' => $user->id,
                'reason' => 'Manager approved staged discount for loyalty guest',
                'payload_json' => json_encode(['discount_percent' => 6, 'manager' => 'Liliana']),
                'occurred_at' => $now->copy()->subMinutes(12),
                'created_at' => $now->copy()->subMinutes(12),
                'updated_at' => $now->copy()->subMinutes(11),
            ],
        ]);

        DB::table('audit_logs')->where('event', 'sale.report.seeded')->delete();
        DB::table('audit_logs')->insert([
            [
                'actor_id' => $user->id,
                'event' => 'sale.report.seeded',
                'entity_type' => 'sale',
                'entity_id' => (string) $saleIds['morningRush'],
                'meta_json' => json_encode(['amount' => 150600, 'payment' => 'cash']),
                'occurred_at' => $now->copy()->subMinutes(6),
                'created_at' => $now->copy()->subMinutes(6),
                'updated_at' => $now->copy()->subMinutes(5),
            ],
            [
                'actor_id' => $user->id,
                'event' => 'sale.report.seeded',
                'entity_type' => 'sale',
                'entity_id' => (string) $saleIds['lunchDraft'],
                'meta_json' => json_encode(['amount' => 20000, 'payment' => 'ewallet']),
                'occurred_at' => $now->copy()->subMinutes(3),
                'created_at' => $now->copy()->subMinutes(3),
                'updated_at' => $now->copy()->subMinutes(2),
            ],
        ]);

        DB::table('receipt_templates')->updateOrInsert(
            ['name' => 'Default Print'],
            [
                'version' => 1,
                'is_active' => true,
                'template_json' => json_encode(['title' => 'PayTo Cafe', 'layout' => 'condensed']),
                'created_by' => $user->id,
                'created_at' => $now->copy()->subMinutes(8),
                'updated_at' => $now->copy()->subMinutes(8),
            ]
        );

        $templateId = (int) DB::table('receipt_templates')->where('name', 'Default Print')->value('id');
        DB::table('receipt_print_logs')->whereIn('sale_id', array_values($saleIds))->delete();
        DB::table('receipt_print_logs')->insert([
            [
                'sale_id' => $saleIds['morningRush'],
                'template_id' => $templateId,
                'printed_by' => $user->id,
                'printed_at' => $now->copy()->subMinutes(2),
                'created_at' => $now->copy()->subMinutes(2),
                'updated_at' => $now->copy()->subMinutes(1),
            ],
        ]);

        foreach ($productIds as $key => $productId) {
            DB::table('inventory_recommendations')->updateOrInsert(
                ['product_id' => $productId],
                [
                    'avg_daily_sales_7d' => match ($key) {
                        'espresso' => 14.3,
                        'cappuccino' => 9.2,
                        'latte' => 7.8,
                        default => 5,
                    },
                    'avg_daily_sales_30d' => match ($key) {
                        'espresso' => 12.1,
                        'cappuccino' => 8.5,
                        'latte' => 6.4,
                        default => 4.2,
                    },
                    'lead_time_days' => 3,
                    'safety_stock' => 15,
                    'reorder_point' => 45,
                    'suggested_reorder_qty' => 120,
                    'computed_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }

        DB::table('stock_movements')->where('ref_type', 'sale')->whereIn('ref_id', array_map('strval', $saleIds))->delete();
        DB::table('stock_movements')->insert([
            [
                'product_id' => $productIds['espresso'],
                'type' => 'SALE_OUT',
                'qty_delta' => -2.0,
                'ref_type' => 'sale',
                'ref_id' => (string) $saleIds['morningRush'],
                'note' => 'Morning rush espresso order',
                'created_by' => $user->id,
                'created_at' => $saleSpecs['morningRush']['occurred_at'],
                'updated_at' => $saleSpecs['morningRush']['occurred_at'],
            ],
            [
                'product_id' => $productIds['cappuccino'],
                'type' => 'SALE_OUT',
                'qty_delta' => -1.0,
                'ref_type' => 'sale',
                'ref_id' => (string) $saleIds['morningRush'],
                'note' => 'Velvet cappuccino for walk-in',
                'created_by' => $user->id,
                'created_at' => $saleSpecs['morningRush']['occurred_at'],
                'updated_at' => $saleSpecs['morningRush']['occurred_at'],
            ],
            [
                'product_id' => $productIds['latte'],
                'type' => 'SALE_OUT',
                'qty_delta' => -1.0,
                'ref_type' => 'sale',
                'ref_id' => (string) $saleIds['lunchDraft'],
                'note' => 'Honey almond latte - lunch queue',
                'created_by' => $user->id,
                'created_at' => $saleSpecs['lunchDraft']['occurred_at'],
                'updated_at' => $saleSpecs['lunchDraft']['occurred_at'],
            ],
            [
                'product_id' => $productIds['latte'],
                'type' => 'ADJUSTMENT',
                'qty_delta' => 5.0,
                'ref_type' => 'manual',
                'ref_id' => 'inventory-check-01',
                'note' => 'Adjustment after morning audit',
                'created_by' => $user->id,
                'created_at' => $now->copy()->subMinutes(20),
                'updated_at' => $now->copy()->subMinutes(20),
            ],
        ]);
    }
}
