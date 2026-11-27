<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(
        protected ReportService $reportService
    ) {}

    /**
     * Muestra el panel ejecutivo de Reportes, BI y Analítica Comercial (CU8).
     * Acceso exclusivo para Administrador y Coordinador.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $user->isCoordinador(), 403, 'Acceso restringido a Administradores y Coordinadores.');

        $filtros = $request->only(['periodo', 'id_version_externo']);
        $metricas = $this->reportService->obtenerMetricas($user, $filtros);

        return Inertia::render('Reports/Index', $metricas);
    }
}
