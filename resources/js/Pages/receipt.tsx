import React from 'react';
import { Head } from '@inertiajs/react';

interface ReceiptItem {
    product_name: string;
    qty: number;
    price: number;
    discount_amount: number;
    final_price: number;
    subtotal: number;
}

interface ReceiptSale {
    id: number;
    local_txn_uuid: string;
    total: number;
    discount_amount: number;
    final_total: number;
    created_at: string;
    items: ReceiptItem[];
    payment: {
        method: string;
        cash_received: number | null;
        change_amount: number | null;
    };
    cashier: {
        name: string;
    };
}

interface ReceiptSettings {
    header: string;
    footer: string;
}

interface Business {
    name: string;
    address: string;
}

interface ReceiptPageProps {
    sale: ReceiptSale;
    receipt_settings: ReceiptSettings;
    business: Business;
}

export default function ReceiptPage({ sale, receipt_settings, business }: ReceiptPageProps) {
    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title={`Struk #${sale.id}`} />
            
            <div className="receipt-container">
                {/* Print button - hidden saat print */}
                <div className="no-print print-button-container">
                    <button 
                        onClick={handlePrint}
                        className="print-button"
                    >
                        🖨️ Cetak Struk
                    </button>
                </div>

                {/* Receipt content */}
                <div className="receipt-paper">
                    {/* Header */}
                    <div className="receipt-header">
                        <div className="store-name">{business.name}</div>
                        <div className="store-info">
                            {receipt_settings.header.split('\n').map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </div>
                    </div>

                    <div className="receipt-divider">{'='.repeat(32)}</div>

                    {/* Transaction info */}
                    <div className="receipt-info">
                        <div>No. Transaksi: {sale.id}</div>
                        <div>Tanggal: {sale.created_at}</div>
                        <div>Kasir: {sale.cashier.name}</div>
                    </div>

                    <div className="receipt-divider">{'-'.repeat(32)}</div>

                    {/* Items */}
                    <div className="receipt-items">
                        {sale.items.map((item, index) => (
                            <div key={index} className="receipt-item">
                                <div className="item-name">{item.product_name}</div>
                                <div className="item-detail">
                                    <span>{item.qty} x {formatCurrency(item.price)}</span>
                                    <span className="item-subtotal">{formatCurrency(item.subtotal)}</span>
                                </div>
                                {item.discount_amount > 0 && (
                                    <div className="item-discount">
                                        Diskon: -{formatCurrency(item.discount_amount)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="receipt-divider">{'-'.repeat(32)}</div>

                    {/* Totals */}
                    <div className="receipt-totals">
                        <div className="total-line">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(sale.total)}</span>
                        </div>
                        {sale.discount_amount > 0 && (
                            <div className="total-line discount">
                                <span>Diskon:</span>
                                <span>-{formatCurrency(sale.discount_amount)}</span>
                            </div>
                        )}
                        <div className="total-line grand-total">
                            <span>TOTAL:</span>
                            <span>{formatCurrency(sale.final_total)}</span>
                        </div>

                        {sale.payment.method === 'CASH' && sale.payment.cash_received && (
                            <>
                                <div className="total-line">
                                    <span>Tunai:</span>
                                    <span>{formatCurrency(sale.payment.cash_received)}</span>
                                </div>
                                <div className="total-line">
                                    <span>Kembali:</span>
                                    <span>{formatCurrency(sale.payment.change_amount || 0)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="receipt-divider">{'='.repeat(32)}</div>

                    {/* Footer */}
                    <div className="receipt-footer">
                        {receipt_settings.footer.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                /* Screen styles */
                .receipt-container {
                    min-height: 100vh;
                    background: #f5f5f5;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .print-button-container {
                    margin-bottom: 20px;
                }

                .print-button {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: all 0.2s;
                }

                .print-button:hover {
                    background: #4338ca;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .receipt-paper {
                    width: 80mm;
                    background: white;
                    padding: 10mm;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.4;
                }

                .receipt-header {
                    text-align: center;
                    margin-bottom: 8px;
                }

                .store-name {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .store-info {
                    font-size: 11px;
                    color: #333;
                }

                .receipt-divider {
                    margin: 8px 0;
                    text-align: center;
                    color: #666;
                    font-size: 10px;
                }

                .receipt-info {
                    margin-bottom: 8px;
                    font-size: 11px;
                }

                .receipt-items {
                    margin: 8px 0;
                }

                .receipt-item {
                    margin-bottom: 8px;
                }

                .item-name {
                    font-weight: bold;
                }

                .item-detail {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                }

                .item-discount {
                    font-size: 11px;
                    color: #666;
                    margin-left: 4px;
                }

                .receipt-totals {
                    margin: 8px 0;
                }

                .total-line {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    font-size: 11px;
                }

                .total-line.discount {
                    color: #666;
                }

                .total-line.grand-total {
                    font-size: 14px;
                    font-weight: bold;
                    margin-top: 4px;
                    padding-top: 4px;
                    border-top: 1px solid #333;
                }

                .receipt-footer {
                    text-align: center;
                    font-size: 11px;
                    color: #666;
                    margin-top: 8px;
                }

                /* Print styles */
                @media print {
                    .no-print {
                        display: none !important;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                    }

                    .receipt-container {
                        background: white;
                        padding: 0;
                        min-height: auto;
                    }

                    .receipt-paper {
                        width: 80mm;
                        box-shadow: none;
                        margin: 0;
                        padding: 5mm;
                    }

                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                }
            `}</style>
        </>
    );
}
