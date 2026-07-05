<?php

namespace App\Enums;

enum UserRole: string
{
    case Cashier = 'CASHIER';
    case Supervisor = 'SUPERVISOR';

    /**
     * Get display name for the role.
     */
    public function label(): string
    {
        return match ($this) {
            self::Cashier => 'Kasir',
            self::Supervisor => 'Supervisor',
        };
    }

    /**
     * Check if the role is supervisor.
     */
    public function isSupervisor(): bool
    {
        return $this === self::Supervisor;
    }

    /**
     * Check if the role is cashier.
     */
    public function isCashier(): bool
    {
        return $this === self::Cashier;
    }
}
