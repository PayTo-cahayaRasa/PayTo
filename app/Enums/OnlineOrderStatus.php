<?php

namespace App\Enums;

enum OnlineOrderStatus: string
{
    case AwaitingPayment = 'MENUNGGU_PEMBAYARAN';
    case PaymentUnderReview = 'PEMBAYARAN_DIPERIKSA';
    case Processing = 'DIPROSES';
    case Shipped = 'DIKIRIM';
    case Completed = 'SELESAI';
    case Cancelled = 'DIBATALKAN';

    public function canTransitionTo(self $status): bool
    {
        return match ($this) {
            self::AwaitingPayment => in_array($status, [self::PaymentUnderReview, self::Processing, self::Cancelled], true),
            self::PaymentUnderReview => in_array($status, [self::Processing, self::Cancelled], true),
            self::Processing => in_array($status, [self::Shipped, self::Completed, self::Cancelled], true),
            self::Shipped => in_array($status, [self::Completed, self::Cancelled], true),
            self::Completed, self::Cancelled => false,
        };
    }
}
