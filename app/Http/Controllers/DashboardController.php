<?php

namespace App\Http\Controllers;

use App\Models\EtapaPipeline;
use App\Models\OrigenLead;
use App\Models\Usuario;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ?ReportService $reportService = null
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $rol = $user->rol?->nombre;

        $stats = [
            'total_usuarios' => Usuario::count(),
            'total_vendedores_activos' => Usuario::where('id_rol', 3)->where('activo', true)->count(),
            'total_etapas' => EtapaPipeline::count(),
            'total_origenes' => OrigenLead::count(),
            'mi_round_robin' => (bool) $user->participa_round_robin,
        ];

        if ($user->isCoordinador()) {
            $reportService = $this->reportService ?? app(ReportService::class);
            $metricas = $reportService->obtenerMetricas($user, ['periodo' => 'todo']);
            $stats['coordinador'] = [
                'total_leads' => $metricas['kpis']['total_leads'] ?? 0,
                'leads_convertidos' => $metricas['kpis']['leads_convertidos'] ?? 0,
                'tasa_conversion' => $metricas['kpis']['tasa_conversion'] ?? 0,
                'leads_activos' => $metricas['kpis']['leads_activos'] ?? 0,
                'programas_asignados' => count($metricas['versiones_filtro'] ?? []),
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'userRol' => $rol,
        ]);
    }
}
