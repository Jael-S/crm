<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
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
            return redirect()->route('login');
        }

        if (! $user->activo) {
            auth()->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect()->route('login')->withErrors(['correo' => 'Su cuenta se encuentra inactiva. Contacte al Administrador.']);
        }

        $userRole = $user->rol?->nombre;

        if (! in_array($userRole, $roles, true)) {
            abort(403, 'Acceso no autorizado para su rol ('.$userRole.').');
        }

        return $next($request);
    }
}
