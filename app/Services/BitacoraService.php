<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class BitacoraService
{
    /**
     * Contrato público de Bitácora para todo el CRM.
     * En Fase 1 registra en log si la tabla aún no existe; en Fase 2 persiste en la BD.
     */
    public static function registrar(
        int $idLead,
        string $tipo,
        string $descripcion,
        ?int $idUsuario = null,
        ?int $idEtapaAnterior = null,
        ?int $idEtapaNueva = null
    ): void {
        Log::info("[BITACORA] Lead #{$idLead} - Tipo: {$tipo} - Desc: {$descripcion} - Usuario: {$idUsuario}");
    }
}
