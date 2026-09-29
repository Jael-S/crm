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
     * Distribuir prospectos de forma rotativa y equitativa entre los vendedores activos.
     * 
     * @param array $leadIds Lista opcional de IDs de prospectos. Si está vacío, toma todos los de bolsa común.
     * @param int $idAdmin Usuario administrador que ejecuta la acción.
     * @return array Resumen de la distribución.
     * @throws Exception Si no hay vendedores habilitados.
     */
    public function distribuir(array $leadIds = [], int $idAdmin = 1): array
    {
        // 1. Obtener vendedores activos con round-robin habilitado
        $vendedores = Usuario::where('activo', true)
            ->where('participa_round_robin', true)
            ->whereHas('rol', function ($q) {
                $q->where('nombre', 'Vendedor');
            })
            ->orderBy('id_usuario', 'asc')
            ->get();

        if ($vendedores->isEmpty()) {
            throw new Exception('No hay asesores comerciales (vendedores) activos con el reparto automático habilitado.');
        }

        // 2. Obtener los leads a distribuir
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

        // 3. Ejecutar reparto equitativo cíclico dentro de una transacción
        $totalVendedores = $vendedores->count();

        DB::transaction(function () use ($leads, $vendedores, $totalVendedores, $idAdmin) {
            foreach ($leads as $index => $lead) {
                $vendedor = $vendedores[$index % $totalVendedores];

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
                    'motivo' => 'Distribución automática Round-Robin',
                    'created_at' => now(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'ASIGNACION',
                    "Asignado automáticamente por Round-Robin a {$vendedor->nombre_completo}",
                    $idAdmin
                );
            }
        });

        return [
            'total_distribuidos' => $leads->count(),
            'vendedores_participantes' => $totalVendedores,
            'mensaje' => "Se distribuyeron con éxito {$leads->count()} prospectos entre {$totalVendedores} vendedores.",
        ];
    }
}
