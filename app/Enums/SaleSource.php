<?php

namespace App\Enums;

enum SaleSource: string
{
    case WalkIn = 'WALK_IN';
    case WhatsApp = 'WHATSAPP';
    case Web = 'WEB';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::WalkIn => 'Walk-in',
            self::WhatsApp => 'WhatsApp',
            self::Web => 'Web',
        };
    }

    /**
     * Get icon/badge color
     */
    public function badgeColor(): string
    {
        return match ($this) {
            self::WalkIn => 'gray',
            self::WhatsApp => 'green',
            self::Web => 'blue',
        };
    }
}
