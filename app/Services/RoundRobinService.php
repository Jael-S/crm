<?php

namespace App\Services;

use App\Models\AsignacionLead;
use App\Models\Lead;
use App\Models\Usuario;
use Exception;
use Illuminate\Support\Facades\DB;

class RoundRobinService
{
    /**
     * Distribuir prospectos de forma inteligente y balanceada según la carga activa
     * de cada vendedor (Workload Balancing / Least Loaded Round-Robin).
     * 
     * @param array $leadIds Lista opcional de IDs de prospectos. Si está vacío, toma todos los de bolsa común.
     * @param int $idAdmin Usuario administrador que ejecuta la acción.
     * @return array Resumen de la distribución.
     * @throws Exception Si no hay vendedores habilitados.
     */
    public function distribuir(array $leadIds = [], int $idAdmin = 1): array
    {
        // 1. Obtener vendedores activos con round-robin habilitado y su carga activa actual (etapas 1 a 4)
        $vendedores = Usuario::where('activo', true)
            ->where('participa_round_robin', true)
            ->whereHas('rol', function ($q) {
                $q->where('nombre', 'Vendedor');
            })
            ->withCount(['leads as leads_activos_count' => function ($q) {
                $q->whereIn('id_etapa', [1, 2, 3, 4]);
            }])
            ->get();

        if ($vendedores->isEmpty()) {
            throw new Exception('No hay asesores comerciales (vendedores) activos con el reparto automático habilitado.');
        }

        // 2. Obtener los leads a distribuir desde la Bolsa Común
        $query = Lead::bolsaComun();
        if (!empty($leadIds)) {
            $query->whereIn('id_lead', $leadIds);
        }

        $leads = $query->orderBy('id_lead', 'asc')->get();

        if ($leads->isEmpty()) {
            return [
                'total_distribuidos' => 0,
                'vendedores_participantes' => $vendedores->count(),
                'mensaje' => 'No se encontraron prospectos en la Bolsa Común para distribuir.',
            ];
        }

        // 3. Inicializar mapa de cargas en memoria para balanceo dinámico durante el lote
        $cargas = [];
        $vendedoresMap = [];
        foreach ($vendedores as $v) {
            $cargas[$v->id_usuario] = (int) $v->leads_activos_count;
            $vendedoresMap[$v->id_usuario] = $v;
        }

        $resumenAsignacion = [];

        // 4. Ejecutar reparto por menor carga de trabajo (Least Loaded) dentro de una transacción
        DB::transaction(function () use ($leads, &$cargas, $vendedoresMap, $idAdmin, &$resumenAsignacion) {
            foreach ($leads as $lead) {
                // Encontrar el vendedor con la menor carga actual
                $minCarga = min($cargas);
                $candidatos = array_keys(array_filter($cargas, fn ($c) => $c === $minCarga));

                // Si hay empate, tomar el primero de la rotación
                $idVendedorElegido = $candidatos[0];
                $vendedor = $vendedoresMap[$idVendedorElegido];

                // Incrementar la carga en memoria para la siguiente iteración
                $cargas[$idVendedorElegido]++;

                $lead->update([
                    'id_vendedor' => $vendedor->id_usuario,
                    'fecha_asignacion' => now(),
                ]);

                AsignacionLead::create([
                    'id_lead' => $lead->id_lead,
                    'id_vendedor_anterior' => null,
                    'id_vendedor_nuevo' => $vendedor->id_usuario,
                    'asignado_por' => $idAdmin,
                    'tipo' => 'ROUND_ROBIN',
                    'motivo' => "Distribución balanceada por carga de trabajo (Carga previa: {$minCarga} prospectos)",
                    'created_at' => now(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'ASIGNACION',
                    "Asignado automáticamente por Round-Robin balanceado a {$vendedor->nombre_completo}",
                    $idAdmin
                );

                $resumenAsignacion[$vendedor->nombre_completo] = ($resumenAsignacion[$vendedor->nombre_completo] ?? 0) + 1;
            }
        });

        $detalleTexto = [];
        foreach ($resumenAsignacion as $nombre => $cant) {
            $detalleTexto[] = "{$nombre}: {$cant}";
        }

        return [
            'total_distribuidos' => $leads->count(),
            'vendedores_participantes' => $vendedores->count(),
            'mensaje' => "Se distribuyeron con éxito {$leads->count()} prospectos equilibrando la carga entre {$vendedores->count()} vendedores (" . implode(', ', $detalleTexto) . ").",
        ];
    }
}
