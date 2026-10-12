<?php

namespace App\Services;

use App\Models\Bitacora;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class BitacoraService
{
    /**
     * Registra un evento en la tabla bitacora y en los logs.
     */
    public static function registrar(
        int $idLead,
        string $tipo,
        string $descripcion,
        ?int $idUsuario = null,
        ?int $idEtapaAnterior = null,
        ?int $idEtapaNueva = null
    ): Bitacora {
        $evento = Bitacora::create([
            'id_lead' => $idLead,
            'id_usuario' => $idUsuario,
            'tipo' => $tipo,
            'descripcion' => $descripcion,
            'id_etapa_anterior' => $idEtapaAnterior,
            'id_etapa_nueva' => $idEtapaNueva,
            'created_at' => now(),
        ]);

        Log::info("[BITACORA] Lead #{$idLead} - Tipo: {$tipo} - Desc: {$descripcion} - Usuario: {$idUsuario}");

        return $evento;
    }

    /**
     * Obtiene el historial completo de eventos para un lead.
     */
    public function obtenerHistorial(int $idLead): Collection
    {
        return Bitacora::with(['usuario.rol', 'etapaAnterior', 'etapaNueva'])
            ->where('id_lead', $idLead)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
