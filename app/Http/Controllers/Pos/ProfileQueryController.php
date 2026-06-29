<?php

namespace App\Http\Controllers\Pos;

use App\Models\Refund;
use App\Models\Sale;
use App\Models\User;
use Illuminate\Support\Carbon;

class ProfileQueryController
{
    public function fetch(?int $userId = null): array
    {
        $user = $userId ? User::find($userId) : auth()->user();

        if (! $user) {
            return $this->emptyProfile();
        }

        $today = Carbon::now()->startOfDay();
        $salesQuery = Sale::query()
            ->when($user?->id, fn ($q) => $q->where('cashier_id', $user->id))
            ->whereDate('occurred_at', $today)
            ->where('status', 'PAID');

        $transactionsToday = (clone $salesQuery)->count();

        $refundsSubquery = Refund::query()
            ->selectRaw('sale_id, SUM(total_amount) as refund_total')
            ->groupBy('sale_id');

        $totalToday = (float) (clone $salesQuery)
            ->leftJoinSub($refundsSubquery, 'refunds', 'refunds.sale_id', '=', 'sales.id')
            ->selectRaw('SUM(grand_total - COALESCE(refunds.refund_total, 0)) as total')
            ->value('total');
        $loginAt = $user?->last_login_at ? Carbon::parse($user->last_login_at) : null;
        $logoutAt = $user?->last_logout_at ? Carbon::parse($user->last_logout_at) : null;
        $today = Carbon::today();
        $workDate = $user?->work_date ? Carbon::parse($user->work_date) : null;
        $workSeconds = $workDate && $workDate->isSameDay($today)
            ? (int) $user->work_seconds
            : 0;

        $durationText = '—';
        if ($loginAt && $loginAt->isSameDay($today)) {
            $isActiveSession = ! $logoutAt || $logoutAt->lessThan($loginAt);
            if ($isActiveSession) {
                $workSeconds += $loginAt->diffInSeconds(Carbon::now());
            }
        }

        if ($workSeconds > 0) {
            $hours = intdiv($workSeconds, 3600);
            $minutes = intdiv($workSeconds % 3600, 60);
            $durationText = sprintf('%dh %02dm', $hours, $minutes);
        }

        $target = 1000000;
        $progress = $target > 0 ? round(($totalToday / $target) * 100) : 0;

        $role = match ($user?->role) {
            'CASHIER' => 'KASIR',
            'SUPERVISOR' => 'ADMIN',
            default => $user?->role ?? 'KASIR',
        };

        return [
            'id' => $user?->id,
            'displayName' => $user?->name ?? 'Kasir',
            'employeeId' => $user ? sprintf('KSR-%03d', $user->id) : null,
            'role' => $role,
            'isActive' => (bool) ($user?->is_active ?? false),
            'totalToday' => $totalToday,
            'transactionsToday' => $transactionsToday,
            'shiftStart' => $loginAt?->format('H:i'),
            'shiftEnd' => $logoutAt?->format('H:i'),
            'shiftDuration' => $durationText,
            'target' => $target,
            'progressPercent' => $progress,
        ];
    }

    private function emptyProfile(): array
    {
        return [
            'id' => null,
            'displayName' => 'Guest',
            'employeeId' => null,
            'role' => 'GUEST',
            'isActive' => false,
            'totalToday' => 0,
            'transactionsToday' => 0,
            'shiftStart' => null,
            'shiftEnd' => null,
            'shiftDuration' => '—',
            'target' => 0,
            'progressPercent' => 0,
        ];
    }
}
