<?php

namespace App\Services;

use App\Models\CoordinadorVersion;
use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\MotivoPerdida;
use App\Models\OrigenLead;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class ReportService
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Genera el conjunto integral de métricas analíticas adaptadas por rol:
     * - Administrador: Visión global de toda la institución o filtrada por programa.
     * - Coordinador: Alcance restringido estrictamente a las versiones asignadas en coordinador_version.
     *
     * @param Usuario $user
     * @param array{periodo?: string, id_version_externo?: int|string} $filtros
     * @return array
     */
    public function obtenerMetricas(Usuario $user, array $filtros = []): array
    {
        $esCoordinador = $user->isCoordinador();
        $versionesAsignadasIds = [];
        $versionesCatalogo = $this->obtenerVersionesCatalogo();

        // 1. Delimitar alcance según rol (CU8 - Regla de alcance estricto)
        if ($esCoordinador) {
            $versionesAsignadasIds = CoordinadorVersion::where('id_usuario', $user->id_usuario)
                ->pluck('id_version_externo')
                ->map(fn ($id) => (int) $id)
                ->toArray();

            // Si el coordinador no tiene versiones asignadas todavía
            if (empty($versionesAsignadasIds)) {
                return $this->respuestaVacia('El coordinador actual no tiene programas asignados en la plataforma.');
            }
        }

        // 2. Construir consulta base de Leads según versiones
        $leadsQuery = Lead::query();

        if ($esCoordinador) {
            // Filtrar solo leads con intereses en las versiones asignadas al coordinador
            if (!empty($filtros['id_version_externo']) && in_array((int) $filtros['id_version_externo'], $versionesAsignadasIds, true)) {
                $versionFiltro = (int) $filtros['id_version_externo'];
                $leadsQuery->whereHas('intereses', function (Builder $q) use ($versionFiltro) {
                    $q->where('id_version_externo', $versionFiltro);
                });
            } else {
                $leadsQuery->whereHas('intereses', function (Builder $q) use ($versionesAsignadasIds) {
                    $q->whereIn('id_version_externo', $versionesAsignadasIds);
                });
            }
        } elseif (!empty($filtros['id_version_externo'])) {
            // Administrador filtrando por una versión específica
            $versionFiltro = (int) $filtros['id_version_externo'];
            $leadsQuery->whereHas('intereses', function (Builder $q) use ($versionFiltro) {
                $q->where('id_version_externo', $versionFiltro);
            });
        }

        // 3. Filtro por período de tiempo
        $this->aplicarFiltroPeriodo($leadsQuery, $filtros['periodo'] ?? 'todo');

        // 4. Cálculo de Totales y KPIs Ejecutivos
        $totalLeads = (clone $leadsQuery)->count();
        $leadsConvertidos = (clone $leadsQuery)->where('id_etapa', 5)->count(); // Convertido / Matriculado
        $leadsActivos = (clone $leadsQuery)->whereIn('id_etapa', [2, 3, 4])->count(); // En seguimiento
        $leadsNuevos = (clone $leadsQuery)->where('id_etapa', 1)->count(); // Bolsa Común
        $leadsPerdidos = (clone $leadsQuery)->where('id_etapa', 6)->count(); // Perdidos / Descartados

        $tasaConversion = $totalLeads > 0 ? round(($leadsConvertidos / $totalLeads) * 100, 1) : 0;
        $tasaPerdida = $totalLeads > 0 ? round(($leadsPerdidos / $totalLeads) * 100, 1) : 0;

        // 5. Embudo de Conversión Académico (6 Etapas Oficiales)
        $etapas = EtapaPipeline::orderBy('orden')->get();
        $embudo = $etapas->map(function ($etapa) use ($leadsQuery, $totalLeads) {
            $totalEtapa = (clone $leadsQuery)->where('id_etapa', $etapa->id_etapa)->count();
            $porcentaje = $totalLeads > 0 ? round(($totalEtapa / $totalLeads) * 100, 1) : 0;

            return [
                'id_etapa' => $etapa->id_etapa,
                'nombre' => $etapa->nombre,
                'orden' => $etapa->orden,
                'total' => $totalEtapa,
                'porcentaje' => $porcentaje,
            ];
        })->values();

        // 6. Canales de Captación (Orígenes de Lead)
        $origenes = OrigenLead::all()->map(function ($origen) use ($leadsQuery, $totalLeads) {
            $totalOrigen = (clone $leadsQuery)->where('id_origen', $origen->id_origen)->count();
            $porcentaje = $totalLeads > 0 ? round(($totalOrigen / $totalLeads) * 100, 1) : 0;

            return [
                'id_origen' => $origen->id_origen,
                'nombre' => $origen->nombre,
                'total' => $totalOrigen,
                'porcentaje' => $porcentaje,
            ];
        })->filter(fn ($o) => $o['total'] > 0)->sortByDesc('total')->values();

        // 7. Top Motivos de Pérdida
        $motivosPerdida = MotivoPerdida::all()->map(function ($motivo) use ($leadsQuery, $leadsPerdidos) {
            $totalMotivo = (clone $leadsQuery)
                ->where('id_etapa', 6)
                ->where('id_motivo_perdida', $motivo->id_motivo_perdida)
                ->count();
            $porcentaje = $leadsPerdidos > 0 ? round(($totalMotivo / $leadsPerdidos) * 100, 1) : 0;

            return [
                'id_motivo_perdida' => $motivo->id_motivo_perdida,
                'nombre' => $motivo->nombre,
                'total' => $totalMotivo,
                'porcentaje' => $porcentaje,
            ];
        })->filter(fn ($m) => $m['total'] > 0)->sortByDesc('total')->values();

        // 8. Monitoreo de Asesores Comerciales (Vendedores atendiendo estos prospectos)
        $asesoresMonitoreo = Usuario::where('activo', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
            ->get()
            ->map(function ($vendedor) use ($leadsQuery) {
                $totalAtendidos = (clone $leadsQuery)->where('id_vendedor', $vendedor->id_usuario)->count();
                $enProceso = (clone $leadsQuery)->where('id_vendedor', $vendedor->id_usuario)->whereIn('id_etapa', [2, 3, 4])->count();
                $convertidos = (clone $leadsQuery)->where('id_vendedor', $vendedor->id_usuario)->where('id_etapa', 5)->count();
                $perdidos = (clone $leadsQuery)->where('id_vendedor', $vendedor->id_usuario)->where('id_etapa', 6)->count();
                $tasa = $totalAtendidos > 0 ? round(($convertidos / $totalAtendidos) * 100, 1) : 0;

                return [
                    'id_usuario' => $vendedor->id_usuario,
                    'nombre' => $vendedor->nombre_completo,
                    'correo' => $vendedor->correo,
                    'total_atendidos' => $totalAtendidos,
                    'en_proceso' => $enProceso,
                    'convertidos' => $convertidos,
                    'perdidos' => $perdidos,
                    'tasa_cierre' => $tasa,
                ];
            })
            ->filter(fn ($v) => $v['total_atendidos'] > 0)
            ->sortByDesc('total_atendidos')
            ->values();

        // 9. Programas disponibles para el filtro
        $versionesFiltro = $versionesCatalogo->filter(function ($v) use ($esCoordinador, $versionesAsignadasIds) {
            if (!$esCoordinador) {
                return true;
            }
            return in_array($v['id_version_externo'], $versionesAsignadasIds, true);
        })->values();

        return [
            'kpis' => [
                'total_leads' => $totalLeads,
                'leads_convertidos' => $leadsConvertidos,
                'leads_activos' => $leadsActivos,
                'leads_nuevos' => $leadsNuevos,
                'leads_perdidos' => $leadsPerdidos,
                'tasa_conversion' => $tasaConversion,
                'tasa_perdida' => $tasaPerdida,
            ],
            'embudo' => $embudo,
            'origenes' => $origenes,
            'motivos_perdida' => $motivosPerdida,
            'asesores' => $asesoresMonitoreo,
            'versiones_filtro' => $versionesFiltro,
            'filtros_aplicados' => [
                'periodo' => $filtros['periodo'] ?? 'todo',
                'id_version_externo' => $filtros['id_version_externo'] ?? '',
            ],
            'es_coordinador' => $esCoordinador,
            'mensaje' => null,
        ];
    }

    private function aplicarFiltroPeriodo(Builder $query, string $periodo): void
    {
        match ($periodo) {
            '30dias' => $query->where('created_at', '>=', now()->subDays(30)),
            'este_mes' => $query->where('created_at', '>=', now()->startOfMonth()),
            'este_ano' => $query->where('created_at', '>=', now()->startOfYear()),
            default => null, // 'todo' no restringe fecha
        };
    }

    private function obtenerVersionesCatalogo()
    {
        $catalogo = $this->catalogService->getCatalogCompleto();
        return collect($catalogo['programas'] ?? [])->flatMap(function ($programa) {
            return collect($programa['versiones'] ?? [])->map(function ($version) use ($programa) {
                return [
                    'id_version_externo' => (int) $version['id'],
                    'nombre' => ($programa['nombre'] ?? 'Programa') . ' — ' . ($version['nombre'] ?? 'Cohorte'),
                    'programa' => $programa['nombre'] ?? 'Programa',
                ];
            });
        });
    }

    private function respuestaVacia(string $mensaje): array
    {
        return [
            'kpis' => [
                'total_leads' => 0,
                'leads_convertidos' => 0,
                'leads_activos' => 0,
                'leads_nuevos' => 0,
                'leads_perdidos' => 0,
                'tasa_conversion' => 0,
                'tasa_perdida' => 0,
            ],
            'embudo' => [],
            'origenes' => [],
            'motivos_perdida' => [],
            'asesores' => [],
            'versiones_filtro' => [],
            'filtros_aplicados' => [
                'periodo' => 'todo',
                'id_version_externo' => '',
            ],
            'es_coordinador' => true,
            'mensaje' => $mensaje,
        ];
    }
}
