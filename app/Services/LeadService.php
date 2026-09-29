<?php

namespace App\Services;

use App\Models\AsignacionLead;
use App\Models\Lead;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class LeadService
{
    /**
     * Listado principal de leads con filtrado por rol y búsqueda.
     */
    public function listar(Usuario $user, array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Lead::with(['origen', 'etapa', 'vendedor', 'creador']);

        // Alcance según rol: Vendedor solo ve sus asignados
        if ($user->isVendedor()) {
            $query->deVendedor($user->id_usuario);
        }

        // Búsqueda por nombre, teléfono o correo
        if (!empty($filtros['search'])) {
            $search = '%' . trim($filtros['search']) . '%';
            $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            
            $query->where(function ($q) use ($search, $like) {
                $q->where('nombre', $like, $search)
                  ->orWhere('telefono', $like, $search)
                  ->orWhere('correo', $like, $search);
            });
        }

        // Filtro por etapa
        if (!empty($filtros['id_etapa'])) {
            $query->where('id_etapa', $filtros['id_etapa']);
        }

        // Filtro por origen
        if (!empty($filtros['id_origen'])) {
            $query->where('id_origen', $filtros['id_origen']);
        }

        // Filtro por vendedor (solo relevante si es Admin o Coordinador)
        if (!empty($filtros['id_vendedor']) && ($user->isAdmin() || $user->isCoordinador())) {
            $query->where('id_vendedor', $filtros['id_vendedor']);
        }

        return $query->latest('id_lead')->paginate($perPage)->withQueryString();
    }

    /**
     * Listado de prospectos en la Bolsa Común (sin vendedor asignado).
     */
    public function listarBolsaComun(array $filtros = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Lead::bolsaComun()->with(['origen', 'etapa', 'creador']);

        if (!empty($filtros['search'])) {
            $search = '%' . trim($filtros['search']) . '%';
            $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            
            $query->where(function ($q) use ($search, $like) {
                $q->where('nombre', $like, $search)
                  ->orWhere('telefono', $like, $search)
                  ->orWhere('correo', $like, $search);
            });
        }

        if (!empty($filtros['id_origen'])) {
            $query->where('id_origen', $filtros['id_origen']);
        }

        return $query->latest('id_lead')->paginate($perPage)->withQueryString();
    }

    /**
     * Crear un nuevo prospecto.
     */
    public function crear(array $datos, int $idCreador): Lead
    {
        return DB::transaction(function () use ($datos, $idCreador) {
            $datos['created_by'] = $idCreador;
            $datos['id_etapa'] = $datos['id_etapa'] ?? 1; // Default: 'Nuevo'
            
            $idVendedor = !empty($datos['id_vendedor']) ? (int) $datos['id_vendedor'] : null;
            $datos['id_vendedor'] = $idVendedor;

            if ($idVendedor) {
                $datos['fecha_asignacion'] = now();
            }

            $lead = Lead::create($datos);

            if ($idVendedor) {
                // Registrar en historial de asignaciones
                AsignacionLead::create([
                    'id_lead' => $lead->id_lead,
                    'id_vendedor_anterior' => null,
                    'id_vendedor_nuevo' => $idVendedor,
                    'asignado_por' => $idCreador,
                    'tipo' => 'MANUAL',
                    'motivo' => 'Asignación al momento del registro',
                    'created_at' => now(),
                ]);

                BitacoraService::registrar(
                    $lead->id_lead,
                    'ASIGNACION',
                    "Prospecto asignado al vendedor #{$idVendedor} en su registro inicial",
                    $idCreador
                );
            } else {
                BitacoraService::registrar(
                    $lead->id_lead,
                    'NOTA',
                    'Prospecto registrado en la Bolsa Común',
                    $idCreador
                );
            }

            return $lead->load(['origen', 'etapa', 'vendedor', 'creador']);
        });
    }

    /**
     * Actualizar datos del prospecto.
     */
    public function actualizar(Lead $lead, array $datos): Lead
    {
        $lead->update($datos);
        return $lead->fresh(['origen', 'etapa', 'vendedor', 'creador']);
    }

    /**
     * Obtener un prospecto por su ID con todas sus relaciones.
     */
    public function obtenerPorId(int $idLead): Lead
    {
        return Lead::with([
            'origen',
            'etapa',
            'vendedor.rol',
            'creador.rol',
            'motivoPerdida',
            'asignaciones.vendedorAnterior',
            'asignaciones.vendedorNuevo',
            'asignaciones.asignadoPor'
        ])->findOrFail($idLead);
    }
}
