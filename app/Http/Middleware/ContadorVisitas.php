<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ContadorVisitas
{
    /**
     * Registra e incrementa el contador de visitas persistente en la BD.
     * Solo incrementa una vez por sesión de usuario para no inflar las métricas
     * mientras el usuario navega entre diferentes pestañas o módulos.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->isMethod('GET') && !$request->expectsJson() && !$request->is('api/*', 'storage/*', 'images/*', 'build/*', 'favicon.ico')) {
            try {
                $pagina = $request->path() === '/' ? 'inicio' : substr($request->path(), 0, 120);

                // 1. Visita Global del Sitio (Solo una vez por sesión completa de usuario)
                if (!$request->session()->has('crm_visita_global_registrada')) {
                    $request->session()->put('crm_visita_global_registrada', true);

                    DB::statement("
                        INSERT INTO visitas (pagina, contador, actualizado_en)
                        VALUES ('global', 1, NOW())
                        ON CONFLICT (pagina)
                        DO UPDATE SET contador = visitas.contador + 1, actualizado_en = NOW()
                    ");
                }

                // 2. Visita por Página Específica (Solo una vez por sesión para esa URL/módulo)
                $pageSessionKey = 'crm_visita_pagina_' . md5($pagina);
                if (!$request->session()->has($pageSessionKey)) {
                    $request->session()->put($pageSessionKey, true);

                    DB::statement("
                        INSERT INTO visitas (pagina, contador, actualizado_en)
                        VALUES (?, 1, NOW())
                        ON CONFLICT (pagina)
                        DO UPDATE SET contador = visitas.contador + 1, actualizado_en = NOW()
                    ", [$pagina]);
                }
            } catch (\Throwable $e) {
                // No interferir con la petición del usuario si ocurre un error
            }
        }

        return $next($request);
    }
}
