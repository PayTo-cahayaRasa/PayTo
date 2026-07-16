/**
 * Admin types for dashboard data and tab state.
 */

export type AdminTab = 'DASHBOARD' | 'INVENTORY' | 'RECEIPT' | 'APPROVALS' | 'USERS' | 'SETTINGS' | 'PRODUCTS' | 'PROFILE';

export type InventoryRecommendation = {
    id: number;
    productName: string;
    sku: string | null;
    stock: number;
    avgSales7d: number;
    leadTime: number;
    reorderPoint: number;
    suggestedQty: number;
    status: 'SAFE' | 'WARNING' | 'CRITICAL';
};

export type ApprovalLog = {
    id: number;
    action: 'DISCOUNT_OVERRIDE' | 'PRICE_OVERRIDE' | 'VOID' | 'REFUND';
    cashier: string;
    reason: string;
    time: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    saleInvoice?: string | null;
    total?: number | null;
    itemsCount?: number | null;
    approver?: string | null;
};

export type StaffMember = {
    id: number;
    name: string;
    role: 'SUPERVISOR' | 'CASHIER';
    username: string;
    status: 'ACTIVE' | 'INACTIVE';
    is_active: boolean;
    lastLogin: string;
};

export type Product = {
    id: number;
    name: string;
    sku: string | null;
    barcode?: string | null;
    price: number;
    discount: number;
    price_after_discount: number;
    cost?: number | null;
    uom: string;
    stock: number;
    is_active: boolean;
    status: 'ACTIVE' | 'INACTIVE';
    image_url?: string | null;
};

export type Notification = {
    id: number;
    title: string;
    message: string;
    type: 'ALERT' | 'INFO' | 'SUCCESS';
    time: string;
    read: boolean;
};

export type AdminProfile = {
    name: string;
    role: string;
    id: string;
    email: string;
    phone: string;
    joinDate: string;
    lastLogin: string;
};
