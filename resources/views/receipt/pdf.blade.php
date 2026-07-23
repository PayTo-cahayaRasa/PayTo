<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 14px 12px; }
        body { color: #111; font: 10px DejaVu Sans, sans-serif; }
        .center { text-align: center; }
        .divider { border-top: 1px dashed #555; margin: 8px 0; }
        .item { margin-bottom: 6px; }
        table { border-collapse: collapse; width: 100%; }
        .right { text-align: right; }
        .total { font-size: 11px; font-weight: bold; }
        .muted { color: #555; }
    </style>
</head>
<body>
    <div class="center">
        <strong>{{ $business['name'] }}</strong><br>
        @foreach (preg_split('/\r\n|\r|\n/', $receipt_settings['header']) as $line)
            {{ $line }}<br>
        @endforeach
        {{ $business['address'] }}
    </div>

    <div class="divider"></div>
    No. Transaksi: {{ $sale['invoice_no'] ?? $sale['id'] }}<br>
    Tanggal: {{ $sale['created_at'] }}<br>
    Kasir: {{ $sale['cashier']['name'] }}
    <div class="divider"></div>

    @foreach ($sale['items'] as $item)
        <div class="item">
            <strong>{{ $item['product_name'] }}</strong><br>
            <table><tr><td>{{ $item['qty'] }} x Rp {{ number_format((float) $item['price'], 0, ',', '.') }}</td><td class="right">Rp {{ number_format((float) $item['line_total'], 0, ',', '.') }}</td></tr></table>
            @if ($item['discount_amount'] > 0)
                <span class="muted">Diskon: -Rp {{ number_format((float) $item['discount_amount'], 0, ',', '.') }}</span>
            @endif
        </div>
    @endforeach

    <div class="divider"></div>
    <table>
        <tr><td>Subtotal</td><td class="right">Rp {{ number_format((float) $sale['subtotal'], 0, ',', '.') }}</td></tr>
        @if ($sale['discount_amount'] > 0)<tr><td>Diskon</td><td class="right">-Rp {{ number_format((float) $sale['discount_amount'], 0, ',', '.') }}</td></tr>@endif
        @if ($sale['tax_total'] > 0)<tr><td>Pajak</td><td class="right">Rp {{ number_format((float) $sale['tax_total'], 0, ',', '.') }}</td></tr>@endif
        <tr class="total"><td>TOTAL</td><td class="right">Rp {{ number_format((float) $sale['total'], 0, ',', '.') }}</td></tr>
        @if ($sale['payment']['method'] === 'CASH')
            <tr><td>Tunai</td><td class="right">Rp {{ number_format((float) $sale['payment']['cash_received'], 0, ',', '.') }}</td></tr>
            <tr><td>Kembali</td><td class="right">Rp {{ number_format((float) $sale['payment']['change_amount'], 0, ',', '.') }}</td></tr>
        @endif
    </table>
    <div class="divider"></div>
    <div class="center">
        @foreach (preg_split('/\r\n|\r|\n/', $receipt_settings['footer']) as $line)
            {{ $line }}<br>
        @endforeach
    </div>
</body>
</html>
