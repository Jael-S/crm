<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $correo, string $password, bool $remember = false): Usuario
    {
        $usuario = Usuario::where('correo', $correo)->first();

        if (! $usuario || ! Hash::check($password, $usuario->password_hash)) {
            throw ValidationException::withMessages([
                'correo' => ['Las credenciales proporcionadas son incorrectas.'],
            ]);
        }

        if (! $usuario->activo) {
            throw ValidationException::withMessages([
                'correo' => ['Su cuenta se encuentra desactivada. Contacte al Administrador.'],
            ]);
        }

        Auth::login($usuario, $remember);

        $usuario->update([
            'ultimo_acceso' => now(),
        ]);

        return $usuario;
    }

    public function logout(): void
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}
