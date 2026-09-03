<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!in_array($user->role, $roles)) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Unauthorized action for your user role.'
                ], 403);
            }

            // Redirect with descriptive flash notice
            return redirect()->route('dashboard')->with('error', 'Access restricted: Your account role does not have permission to view this page.');
        }

        return $next($request);
    }
}
