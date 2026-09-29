<?php

namespace App\Services;

use App\Models\AsignacionLead;
use App\Models\Lead;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;

class AssignmentService
{
    /**
     * Asignar manualmente un prospecto a un vendedor.
     * Permitido para Administrador y Coordinador (RF2.3).
     */
    public function asignarManual(Lead $lead, int $idVendedorNuevo, int $idAsignador): Lead
    {
        return DB::transaction(function () use ($lead, $idVendedorNuevo, $idAsignador) {
            $vendedorNuevo = Usuario::findOrFail($idVendedorNuevo);
            $idVendedorAnterior = $lead->id_vendedor;

            // Actualizar prospecto
            $lead->update([
                'id_vendedor' => $idVendedorNuevo,
                'fecha_asignacion' => now(),
            ]);

            $motivo = $idVendedorAnterior 
                ? "Reasignación manual a {$vendedorNuevo->nombre_completo}"
                : "Asignación manual desde bolsa común a {$vendedorNuevo->nombre_completo}";

            // Registrar en historial
            AsignacionLead::create([
                'id_lead' => $lead->id_lead,
                'id_vendedor_anterior' => $idVendedorAnterior,
                'id_vendedor_nuevo' => $idVendedorNuevo,
                'asignado_por' => $idAsignador,
                'tipo' => 'MANUAL',
                'motivo' => $motivo,
                'created_at' => now(),
            ]);

            // Auditoría en Bitácora
            BitacoraService::registrar(
                $lead->id_lead,
                'ASIGNACION',
                $motivo,
                $idAsignador
            );

            return $lead->fresh(['vendedor', 'asignaciones.vendedorNuevo', 'asignaciones.asignadoPor']);
        });
    }

    /**
     * Transferir un prospecto a otro vendedor con motivo justificado.
     * Permitido para Administrador y Coordinador (RF2.3).
     */
    public function transferir(Lead $lead, int $idVendedorNuevo, string $motivo, int $idAsignador): Lead
    {
        return DB::transaction(function () use ($lead, $idVendedorNuevo, $motivo, $idAsignador) {
            $vendedorNuevo = Usuario::findOrFail($idVendedorNuevo);
            $idVendedorAnterior = $lead->id_vendedor;

            // Actualizar prospecto
            $lead->update([
                'id_vendedor' => $idVendedorNuevo,
                'fecha_asignacion' => now(),
            ]);

            // Registrar en historial con tipo TRANSFERENCIA
            AsignacionLead::create([
                'id_lead' => $lead->id_lead,
                'id_vendedor_anterior' => $idVendedorAnterior,
                'id_vendedor_nuevo' => $idVendedorNuevo,
                'asignado_por' => $idAsignador,
                'tipo' => 'TRANSFERENCIA',
                'motivo' => $motivo,
                'created_at' => now(),
            ]);

            // Auditoría en Bitácora
            BitacoraService::registrar(
                $lead->id_lead,
                'ASIGNACION',
                "Transferencia a {$vendedorNuevo->nombre_completo}. Motivo: {$motivo}",
                $idAsignador
            );

            return $lead->fresh(['vendedor', 'asignaciones.vendedorNuevo', 'asignaciones.asignadoPor']);
        });
    }
}
