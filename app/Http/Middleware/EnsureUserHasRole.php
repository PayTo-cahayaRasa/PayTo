<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthorized. Authentication required.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Forbidden. User account is inactive.',
            ], 403);
        }

        $allowedRoles = array_map(
            static fn (string $role): string => strtoupper($role),
            $roles,
        );

        if (! in_array(strtoupper((string) $user->role), $allowedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
