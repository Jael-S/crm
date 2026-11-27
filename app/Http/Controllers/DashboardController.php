<?php

namespace App\Http\Controllers;

use App\Models\EtapaPipeline;
use App\Models\OrigenLead;
use App\Models\Usuario;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $esVendedor = $user->isVendedor();
        $esCoordinador = $user->isCoordinador();
        $esAdmin = $user->isAdmin();
        $esAdminOCoordinador = $esAdmin || $esCoordinador;

        // Identificar versiones asignadas al Coordinador (coordinador_version)
        $coordinadorVersiones = [];
        $programaAsignadoNombre = null;

        if ($esCoordinador) {
            $coordinadorVersiones = DB::table('coordinador_version')
                ->where('id_usuario', $user->id_usuario)
                ->pluck('id_version_externo')
                ->map(fn($v) => (int) $v)
                ->toArray();

            if (!empty($coordinadorVersiones)) {
                $progs = DB::table('lead_interes')
                    ->where('tipo', 'PROGRAMA')
                    ->whereIn('id_version_externo', $coordinadorVersiones)
                    ->distinct()
                    ->pluck('nombre_snapshot')
                    ->toArray();

                $programaAsignadoNombre = !empty($progs) 
                    ? implode(' / ', array_slice($progs, 0, 2)) 
                    : ('Versión ' . implode(', ', $coordinadorVersiones));
            }
        }

        $filtrarPorCoordinador = $esCoordinador && !empty($coordinadorVersiones);
        $versionList = $filtrarPorCoordinador ? implode(',', $coordinadorVersiones) : null;

        // 1. Reporte 1: Embudo de Ventas General (REPORTEEMBUDO[])
        if ($filtrarPorCoordinador) {
            $reporteEmbudo = DB::select("
                SELECT 
                    ep.id_etapa,
                    ep.nombre AS etapa_nombre,
                    ep.orden,
                    COUNT(l.id_lead) AS total_leads,
                    ROUND((COUNT(l.id_lead) * 100.0 / NULLIF((
                        SELECT COUNT(DISTINCT l2.id_lead) 
                        FROM public.leads l2 
                        WHERE l2.id_lead IN (
                            SELECT li2.id_lead FROM public.lead_interes li2 
                            WHERE li2.tipo = 'PROGRAMA' AND li2.id_version_externo IN ($versionList)
                        )
                    ), 0)), 1) AS porcentaje
                FROM public.etapas_pipeline ep
                LEFT JOIN public.leads l ON ep.id_etapa = l.id_etapa 
                    AND l.id_lead IN (
                        SELECT li.id_lead FROM public.lead_interes li 
                        WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                    )
                GROUP BY ep.id_etapa, ep.nombre, ep.orden
                ORDER BY ep.orden ASC;
            ");
        } else {
            $reporteEmbudo = DB::select("
                SELECT 
                    ep.id_etapa,
                    ep.nombre AS etapa_nombre,
                    ep.orden,
                    COUNT(l.id_lead) AS total_leads,
                    ROUND((COUNT(l.id_lead) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.leads), 0)), 1) AS porcentaje
                FROM public.etapas_pipeline ep
                LEFT JOIN public.leads l ON ep.id_etapa = l.id_etapa
                GROUP BY ep.id_etapa, ep.nombre, ep.orden
                ORDER BY ep.orden ASC;
            ");
        }

        // 2. Reporte 2: Tasa Global de Conversión (REPORTECONVERSION[])
        if ($filtrarPorCoordinador) {
            $metricasGlobales = DB::select("
                SELECT 
                    COUNT(*) AS total_leads,
                    COUNT(CASE WHEN id_etapa = 5 THEN 1 END) AS convertidos,
                    COUNT(CASE WHEN id_etapa = 6 THEN 1 END) AS perdidos,
                    COUNT(CASE WHEN id_etapa BETWEEN 1 AND 4 THEN 1 END) AS en_proceso,
                    ROUND((COUNT(CASE WHEN id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) AS tasa_conversion,
                    ROUND((COUNT(CASE WHEN id_etapa = 6 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) AS tasa_desercion
                FROM public.leads
                WHERE id_lead IN (
                    SELECT li.id_lead FROM public.lead_interes li 
                    WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                );
            ");
        } else {
            $metricasGlobales = DB::select("
                SELECT 
                    COUNT(*) AS total_leads,
                    COUNT(CASE WHEN id_etapa = 5 THEN 1 END) AS convertidos,
                    COUNT(CASE WHEN id_etapa = 6 THEN 1 END) AS perdidos,
                    COUNT(CASE WHEN id_etapa BETWEEN 1 AND 4 THEN 1 END) AS en_proceso,
                    ROUND((COUNT(CASE WHEN id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) AS tasa_conversion,
                    ROUND((COUNT(CASE WHEN id_etapa = 6 THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 1) AS tasa_desercion
                FROM public.leads;
            ");
        }

        $matrizVendedores = [];
        if ($esAdminOCoordinador) {
            if ($filtrarPorCoordinador) {
                $matrizVendedores = DB::select("
                    SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        COUNT(l.id_lead) AS total_asignados,
                        COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) AS convertidos,
                        COUNT(CASE WHEN l.id_etapa = 6 THEN 1 END) AS perdidos,
                        COUNT(CASE WHEN l.id_etapa BETWEEN 1 AND 4 THEN 1 END) AS en_proceso,
                        ROUND((COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(l.id_lead), 0)), 1) AS tasa_conversion
                    FROM public.usuarios u
                    LEFT JOIN public.leads l ON u.id_usuario = l.id_vendedor 
                        AND l.id_lead IN (
                            SELECT li.id_lead FROM public.lead_interes li 
                            WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                        )
                    WHERE u.id_rol = 3 AND u.activo = true
                    GROUP BY u.id_usuario, u.nombre_completo
                    ORDER BY convertidos DESC, tasa_conversion DESC;
                ");
            } else {
                $matrizVendedores = DB::select("
                    SELECT 
                        u.id_usuario,
                        u.nombre_completo,
                        COUNT(l.id_lead) AS total_asignados,
                        COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) AS convertidos,
                        COUNT(CASE WHEN l.id_etapa = 6 THEN 1 END) AS perdidos,
                        COUNT(CASE WHEN l.id_etapa BETWEEN 1 AND 4 THEN 1 END) AS en_proceso,
                        ROUND((COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(l.id_lead), 0)), 1) AS tasa_conversion
                    FROM public.usuarios u
                    LEFT JOIN public.leads l ON u.id_usuario = l.id_vendedor
                    WHERE u.id_rol = 3 AND u.activo = true
                    GROUP BY u.id_usuario, u.nombre_completo
                    ORDER BY convertidos DESC, tasa_conversion DESC;
                ");
            }
        }

        // 3. Reporte 3: Efectividad por Canal de Captación (REPORTEORIGENES[])
        $reporteOrigenes = [];
        if ($esAdminOCoordinador) {
            if ($filtrarPorCoordinador) {
                $reporteOrigenes = DB::select("
                    SELECT 
                        o.id_origen,
                        o.nombre AS origen_nombre,
                        COUNT(l.id_lead) AS total_leads,
                        COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) AS convertidos,
                        ROUND((COUNT(l.id_lead) * 100.0 / NULLIF((
                            SELECT COUNT(DISTINCT l2.id_lead) 
                            FROM public.leads l2 
                            WHERE l2.id_lead IN (
                                SELECT li2.id_lead FROM public.lead_interes li2 
                                WHERE li2.tipo = 'PROGRAMA' AND li2.id_version_externo IN ($versionList)
                            )
                        ), 0)), 1) AS porcentaje_participacion,
                        ROUND((COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(l.id_lead), 0)), 1) AS tasa_conversion_canal
                    FROM public.origenes_lead o
                    LEFT JOIN public.leads l ON o.id_origen = l.id_origen
                        AND l.id_lead IN (
                            SELECT li.id_lead FROM public.lead_interes li 
                            WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                        )
                    GROUP BY o.id_origen, o.nombre
                    ORDER BY total_leads DESC;
                ");
            } else {
                $reporteOrigenes = DB::select("
                    SELECT 
                        o.id_origen,
                        o.nombre AS origen_nombre,
                        COUNT(l.id_lead) AS total_leads,
                        COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) AS convertidos,
                        ROUND((COUNT(l.id_lead) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.leads), 0)), 1) AS porcentaje_participacion,
                        ROUND((COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(l.id_lead), 0)), 1) AS tasa_conversion_canal
                    FROM public.origenes_lead o
                    LEFT JOIN public.leads l ON o.id_origen = l.id_origen
                    GROUP BY o.id_origen, o.nombre
                    ORDER BY total_leads DESC;
                ");
            }
        }

        // 4. Reporte 4: Causales de Pérdida y Deserción (REPORTEMOTIVOSPERDIDA[])
        $reporteMotivosPerdida = [];
        $comentariosPerdidaRecientes = [];
        if ($esAdminOCoordinador) {
            if ($filtrarPorCoordinador) {
                $reporteMotivosPerdida = DB::select("
                    SELECT 
                        mp.id_motivo,
                        mp.nombre AS motivo_nombre,
                        COUNT(l.id_lead) AS total_perdidos,
                        ROUND(
                            (COUNT(l.id_lead) * 100.0 / NULLIF((
                                SELECT COUNT(*) FROM public.leads l3 
                                WHERE l3.id_etapa = 6 AND l3.id_lead IN (
                                    SELECT li3.id_lead FROM public.lead_interes li3 
                                    WHERE li3.tipo = 'PROGRAMA' AND li3.id_version_externo IN ($versionList)
                                )
                            ), 0)), 
                            1
                        ) AS porcentaje_desercion
                    FROM public.motivos_perdida mp
                    LEFT JOIN public.leads l ON mp.id_motivo = l.id_motivo_perdida AND l.id_etapa = 6
                        AND l.id_lead IN (
                            SELECT li.id_lead FROM public.lead_interes li 
                            WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                        )
                    GROUP BY mp.id_motivo, mp.nombre
                    ORDER BY total_perdidos DESC;
                ");

                $comentariosPerdidaRecientes = DB::select("
                    SELECT 
                        l.id_lead,
                        l.nombre,
                        mp.nombre AS motivo_nombre,
                        l.comentario_perdida,
                        u.nombre_completo AS vendedor_nombre,
                        l.updated_at
                    FROM public.leads l
                    LEFT JOIN public.motivos_perdida mp ON l.id_motivo_perdida = mp.id_motivo
                    LEFT JOIN public.usuarios u ON l.id_vendedor = u.id_usuario
                    WHERE l.id_etapa = 6 AND l.comentario_perdida IS NOT NULL
                        AND l.id_lead IN (
                            SELECT li.id_lead FROM public.lead_interes li 
                            WHERE li.tipo = 'PROGRAMA' AND li.id_version_externo IN ($versionList)
                        )
                    ORDER BY l.updated_at DESC
                    LIMIT 6;
                ");
            } else {
                $reporteMotivosPerdida = DB::select("
                    SELECT 
                        mp.id_motivo,
                        mp.nombre AS motivo_nombre,
                        COUNT(l.id_lead) AS total_perdidos,
                        ROUND(
                            (COUNT(l.id_lead) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.leads WHERE id_etapa = 6), 0)), 
                            1
                        ) AS porcentaje_desercion
                    FROM public.motivos_perdida mp
                    LEFT JOIN public.leads l ON mp.id_motivo = l.id_motivo_perdida AND l.id_etapa = 6
                    GROUP BY mp.id_motivo, mp.nombre
                    ORDER BY total_perdidos DESC;
                ");

                $comentariosPerdidaRecientes = DB::select("
                    SELECT 
                        l.id_lead,
                        l.nombre,
                        mp.nombre AS motivo_nombre,
                        l.comentario_perdida,
                        u.nombre_completo AS vendedor_nombre,
                        l.updated_at
                    FROM public.leads l
                    LEFT JOIN public.motivos_perdida mp ON l.id_motivo_perdida = mp.id_motivo
                    LEFT JOIN public.usuarios u ON l.id_vendedor = u.id_usuario
                    WHERE l.id_etapa = 6 AND l.comentario_perdida IS NOT NULL
                    ORDER BY l.updated_at DESC
                    LIMIT 6;
                ");
            }
        }

        // 5. Reporte 5: Panel de Control del Vendedor (DASHBOARDVENDEDOR[])
        $dashboardVendedor = null;
        if ($esVendedor) {
            $idVendedor = $user->id_usuario;
            $cartera = DB::selectOne("
                SELECT 
                    COUNT(l.id_lead) AS total_cartera,
                    COUNT(CASE WHEN l.id_etapa BETWEEN 1 AND 4 THEN 1 END) AS activos,
                    COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) AS convertidos,
                    COUNT(CASE WHEN l.id_etapa = 6 THEN 1 END) AS perdidos,
                    ROUND((COUNT(CASE WHEN l.id_etapa = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(l.id_lead), 0)), 1) AS tasa_conversion
                FROM public.leads l
                WHERE l.id_vendedor = :id_vendedor;
            ", ['id_vendedor' => $idVendedor]);

            $etapasVendedor = DB::select("
                SELECT 
                    ep.id_etapa,
                    ep.nombre AS etapa_nombre,
                    ep.orden,
                    COUNT(l.id_lead) AS total_leads,
                    ROUND((COUNT(l.id_lead) * 100.0 / NULLIF((SELECT COUNT(*) FROM public.leads WHERE id_vendedor = :id_vendedor), 0)), 1) AS porcentaje
                FROM public.etapas_pipeline ep
                LEFT JOIN public.leads l ON ep.id_etapa = l.id_etapa AND l.id_vendedor = :id_vendedor
                GROUP BY ep.id_etapa, ep.nombre, ep.orden
                ORDER BY ep.orden ASC;
            ", ['id_vendedor' => $idVendedor]);

            $recordatoriosPendientes = DB::select("
                SELECT r.id_recordatorio, r.id_lead, l.nombre AS lead_nombre, l.telefono AS lead_telefono, r.fecha_hora, r.descripcion AS nota
                FROM public.recordatorios r
                JOIN public.leads l ON r.id_lead = l.id_lead
                WHERE r.id_usuario = :id_vendedor AND r.estado = 'PENDIENTE'
                ORDER BY r.fecha_hora ASC
                LIMIT 6;
            ", ['id_vendedor' => $idVendedor]);

            $disponiblesBolsa = DB::selectOne("
                SELECT COUNT(*) AS disponibles_bolsa 
                FROM public.leads 
                WHERE id_vendedor IS NULL AND id_etapa NOT IN (5, 6);
            ")->disponibles_bolsa ?? 0;

            $leadsCalientes = DB::select("
                SELECT l.id_lead, l.nombre, l.telefono, ep.nombre AS etapa_nombre, l.id_etapa, l.updated_at
                FROM public.leads l
                JOIN public.etapas_pipeline ep ON l.id_etapa = ep.id_etapa
                WHERE l.id_vendedor = :id_vendedor AND l.id_etapa BETWEEN 2 AND 4
                ORDER BY l.updated_at DESC
                LIMIT 6;
            ", ['id_vendedor' => $idVendedor]);

            $dashboardVendedor = [
                'cartera' => $cartera,
                'etapas' => $etapasVendedor,
                'recordatorios_pendientes' => $recordatoriosPendientes,
                'disponibles_bolsa' => $disponiblesBolsa,
                'leads_calientes' => $leadsCalientes,
            ];
        }

        // Métricas básicas para compatibilidad
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
            'esCoordinador' => $esCoordinador,
            'programaAsignadoNombre' => $programaAsignadoNombre,
            'reporteEmbudo' => $reporteEmbudo,
            'metricasGlobales' => $metricasGlobales[0] ?? null,
            'matrizVendedores' => $matrizVendedores,
            'reporteOrigenes' => $reporteOrigenes,
            'reporteMotivosPerdida' => $reporteMotivosPerdida,
            'comentariosPerdidaRecientes' => $comentariosPerdidaRecientes,
            'dashboardVendedor' => $dashboardVendedor,
        ]);
    }
}
