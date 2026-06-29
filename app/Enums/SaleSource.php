<?php

namespace App\Enums;

enum SaleSource: string
{
    case WalkIn = 'WALK_IN';
    case WhatsApp = 'WHATSAPP';

    /**
     * Get human-readable label
     */
    public function label(): string
    {
        return match ($this) {
            self::WalkIn => 'Walk-in',
            self::WhatsApp => 'WhatsApp',
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
        };
    }
}
