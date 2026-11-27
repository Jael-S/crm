<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\Usuario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetController extends Controller
{
    /**
     * Muestra la vista para solicitar el enlace de recuperación.
     */
    public function showForgotPasswordForm(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Envía el correo con el enlace de recuperación firmado y temporal.
     */
    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate([
            'correo' => ['required', 'email'],
        ], [
            'correo.required' => 'El correo electrónico es obligatorio.',
            'correo.email' => 'Ingrese una dirección de correo válida.',
        ]);

        $usuario = Usuario::where('correo', $request->input('correo'))->first();

        if (!$usuario) {
            return redirect()->back()->withErrors([
                'correo' => 'No encontramos ninguna cuenta registrada con este correo electrónico.',
            ]);
        }

        if (!$usuario->activo) {
            return redirect()->back()->withErrors([
                'correo' => 'Esta cuenta se encuentra desactivada. Contacte al Administrador.',
            ]);
        }

        try {
            // Asegurar que la URL generada use estrictamente APP_URL del .env para deploys de producción
            if (config('app.url')) {
                URL::forceRootUrl(rtrim(config('app.url'), '/'));
            }

            // URL firmada temporal válida por 30 minutos
            $resetUrl = URL::temporarySignedRoute(
                'password.reset',
                now()->addMinutes(30),
                ['id' => $usuario->id_usuario]
            );

            Mail::to($usuario->correo)->send(new PasswordResetMail($usuario, $resetUrl));

            return redirect()->back()->with('success', '¡Enlace enviado! Hemos enviado las instrucciones de recuperación a tu correo electrónico.');
        } catch (\Throwable $e) {
            Log::error("[PASSWORD-RESET] Error enviando correo a {$usuario->correo}: " . $e->getMessage());

            return redirect()->back()->withErrors([
                'correo' => 'No se pudo enviar el correo: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Muestra el formulario para ingresar la nueva contraseña validando la firma.
     */
    public function showResetPasswordForm(int $id, Request $request): Response|RedirectResponse
    {
        if (!$request->hasValidSignature()) {
            return redirect()->route('password.request')->withErrors([
                'correo' => 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.',
            ]);
        }

        $usuario = Usuario::findOrFail($id);

        return Inertia::render('Auth/ResetPassword', [
            'id' => $usuario->id_usuario,
            'correo' => $usuario->correo,
            'nombre' => $usuario->nombre_completo,
        ]);
    }

    /**
     * Guarda la nueva contraseña del usuario.
     */
    public function resetPassword(int $id, Request $request): RedirectResponse
    {
        if (!$request->hasValidSignature()) {
            return redirect()->route('password.request')->withErrors([
                'correo' => 'El enlace de recuperación es inválido o ha expirado.',
            ]);
        }

        $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        $usuario = Usuario::findOrFail($id);
        $usuario->update([
            'password_hash' => Hash::make($request->input('password')),
        ]);

        return redirect()->route('login')->with('success', '¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.');
    }
}
