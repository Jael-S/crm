<?php

namespace App\Services;

use App\Models\CoordinadorVersion;
use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PipelineService
{
    /**
     * Obtiene las 6 etapas del pipeline con sus respectivos prospectos asociados.
     */
    public function obtenerTablero(Usuario $user, array $filtros = []): array
    {
        $etapas = EtapaPipeline::orderBy('orden')->get();

        $leadsQuery = Lead::with([
            'origen',
            'vendedor',
            'profesion',
            'descuento',
            'intereses',
            'motivoPerdida',
            'comprobantes',
        ]);

        // Alcance por rol
        if ($user->isVendedor()) {
            $leadsQuery->where('id_vendedor', $user->id_usuario);
        } elseif ($user->isCoordinador()) {
            $versionIds = CoordinadorVersion::where('id_usuario', $user->id_usuario)
                ->pluck('id_version_externo');

            $leadsQuery->whereHas('intereses', function ($q) use ($versionIds) {
                $q->where('tipo', 'PROGRAMA')->whereIn('id_version_externo', $versionIds);
            });
        }

        // Filtro opcional por vendedor (para Admin y Coordinador)
        if (!empty($filtros['id_vendedor']) && ($user->isAdmin() || $user->isCoordinador())) {
            $leadsQuery->where('id_vendedor', $filtros['id_vendedor']);
        }

        // Filtro por búsqueda de texto
        if (!empty($filtros['search'])) {
            $search = '%' . trim($filtros['search']) . '%';
            $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
            $leadsQuery->where(function ($q) use ($search, $like) {
                $q->where('nombre', $like, $search)
                  ->orWhere('telefono', $like, $search)
                  ->orWhere('correo', $like, $search);
            });
        }

        $allLeads = $leadsQuery->latest('updated_at')->get();

        // Agrupar prospectos por id_etapa
        $columnas = $etapas->map(function ($etapa) use ($allLeads) {
            return [
                'id_etapa' => $etapa->id_etapa,
                'nombre' => $etapa->nombre,
                'orden' => $etapa->orden,
                'leads' => $allLeads->where('id_etapa', $etapa->id_etapa)->values(),
            ];
        });

        return [
            'columnas' => $columnas,
            'total_leads' => $allLeads->count(),
        ];
    }

    /**
     * Realiza la transición de etapa de un prospecto validando reglas de negocio.
     * 
     * @throws ValidationException Si faltan datos obligatorios para Perdido o Convertido
     */
    public function cambiarEtapa(Lead $lead, int $nuevaEtapaId, array $datos, Usuario $usuario): Lead
    {
        return DB::transaction(function () use ($lead, $nuevaEtapaId, $datos, $usuario) {
            $etapaAnterior = $lead->etapa;
            $etapaNueva = EtapaPipeline::findOrFail($nuevaEtapaId);

            // Regla RF3.3: Marcar como Perdido requiere motivo obligatorio
            if ($nuevaEtapaId === 6) {
                if (empty($datos['id_motivo_perdida'])) {
                    throw ValidationException::withMessages([
                        'id_motivo_perdida' => 'Debe seleccionar obligatoriamente un motivo para marcar el prospecto como Perdido.',
                    ]);
                }

                $lead->id_motivo_perdida = $datos['id_motivo_perdida'];
                $lead->comentario_perdida = $datos['comentario_perdida'] ?? null;
            } else {
                // Si sale de Perdido a otra etapa, limpiamos los datos de descarte
                if ($lead->id_etapa === 6) {
                    $lead->id_motivo_perdida = null;
                    $lead->comentario_perdida = null;
                }
            }

            // Regla RF3.4: Marcar como Convertido requiere datos completos de alumno
            if ($nuevaEtapaId === 5) {
                // Si vienen datos adicionales en la petición, los sincronizamos
                if (!empty($datos['ci'])) $lead->ci = $datos['ci'];
                if (!empty($datos['nombre_completo'])) $lead->nombre_completo = $datos['nombre_completo'];
                if (!empty($datos['fecha_nacimiento'])) $lead->fecha_nacimiento = $datos['fecha_nacimiento'];
                if (!empty($datos['ciudad'])) $lead->ciudad = $datos['ciudad'];

                // Si nombre_completo está vacío, usamos el nombre del prospecto
                if (empty($lead->nombre_completo)) {
                    $lead->nombre_completo = $lead->nombre;
                }

                // Validación estricta
                $faltantes = [];
                if (empty($lead->ci)) $faltantes[] = 'Cédula de Identidad (CI)';
                if (empty($lead->fecha_nacimiento)) $faltantes[] = 'Fecha de Nacimiento';
                if (empty($lead->ciudad)) $faltantes[] = 'Ciudad de Residencia';

                if (!empty($faltantes)) {
                    throw ValidationException::withMessages([
                        'conversion' => 'No es posible convertir el prospecto a alumno. Faltan los siguientes campos obligatorios: ' . implode(', ', $faltantes) . '.',
                    ]);
                }
            }

            $lead->id_etapa = $nuevaEtapaId;
            $lead->save();

            // Disparar bitácora automática de auditoría
            BitacoraService::registrar(
                $lead->id_lead,
                'CAMBIO_ESTADO',
                "Prospecto movido de la etapa '{$etapaAnterior->nombre}' a '{$etapaNueva->nombre}'",
                $usuario->id_usuario,
                $etapaAnterior->id_etapa,
                $etapaNueva->id_etapa
            );

            return $lead->load(['origen', 'etapa', 'vendedor', 'profesion', 'descuento', 'motivoPerdida']);
        });
    }
}
