<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\ContadorVisitas::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'checkRole' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Manejo resiliente de caídas de Base de Datos para defensas
        $exceptions->render(function (\Illuminate\Database\QueryException $e, Request $request) {
            $code = $e->getCode();
            $msg = 'Fallo en la operación con la base de datos PostgreSQL.';
            if ($code === '23505') {
                $msg = 'Conflicto de registro duplicado o clave única en la base de datos.';
            } elseif ($code === '23503') {
                $msg = 'No es posible realizar la acción por restricción de integridad referencial (registros vinculados).';
            } elseif (str_contains($e->getMessage(), 'Connection refused') || str_contains($e->getMessage(), 'conectar')) {
                $msg = 'Fallo de conexión con PostgreSQL. Verifique que el servicio esté activo.';
            }

            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $msg,
                    'detail' => config('app.debug') ? $e->getMessage() : null,
                ], 500);
            }

            return back()->with('error', $msg . (config('app.debug') ? ' [Detalle: ' . $e->getMessage() . ']' : ''));
        });

        // Manejo controlado de registro no encontrado (evitar pantalla 404/500 genérica)
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El registro solicitado no fue encontrado o fue eliminado.',
                ], 404);
            }

            return back()->with('error', 'El registro solicitado no existe o ya no está disponible.');
        });
    })->create();
