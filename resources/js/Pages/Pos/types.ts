export type Product = {
    id: number;
    name: string;
    price: number;
    discount?: number;
    category: string;
    stock: number;
    sku: string;
    isFavorite?: boolean;
    imageColor?: string;
};

export type CartItem = Product & {
    qty: number;
    discount: number;
    discountPercent: number;
};

export type PaymentMethod = 'CASH' | 'EWALLET';

export type Category = {
    id: string;
    label: string;
    icon: any;
};

export type TransactionItem = {
    id: string;
    name: string;
    qty: number;
    price: number;
    lineTotal: number;
    refundUnitPrice: number;
    refundedQty: number;
    refundableQty: number;
};

export type TransactionHistory = {
    id: string;
    saleId: number;
    invoiceNo: string;
    time: string;
    status: 'PAID' | 'VOID';
    paymentMethod: 'CASH' | 'EWALLET';
    totalBeforeDiscount: number;
    discountTotal: number;
    totalAfterDiscount: number;
    taxTotal: number;
    total: number;
    items: number;
    refundedTotal: number;
    refundableRemaining: number;
    pendingRefundTotal: number;
    hasPendingRefundApproval: boolean;
    refundDeadline?: string | null;
    canRefund?: boolean;

    itemsDetail: TransactionItem[];
};
