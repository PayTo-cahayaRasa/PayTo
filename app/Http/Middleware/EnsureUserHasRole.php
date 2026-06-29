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
        if (! $request->user()) {
            return response()->json([
                'message' => 'Unauthorized. Authentication required.',
            ], 401);
        }

        $userRole = $request->user()->role;

        // Convert string roles to enum cases for comparison
        $allowedRoles = array_map(fn ($role) => strtoupper($role), $roles);

        if (! in_array(strtoupper($userRole), $allowedRoles, true)) {
            return response()->json([
                'message' => 'Forbidden. Insufficient permissions.',
            ], 403);
        }

        return $next($request);
    }
}
