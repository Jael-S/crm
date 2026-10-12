<?php

namespace App\Services;

use App\Models\Recordatorio;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Collection;

class RecordatorioService
{
    /**
     * Listado de recordatorios de un usuario (o todos si es admin).
     */
    public function listarPorUsuario(Usuario $usuario): Collection
    {
        $query = Recordatorio::with(['lead', 'usuario']);

        if ($usuario->isVendedor()) {
            $query->where('id_usuario', $usuario->id_usuario);
        }

        return $query->orderBy('fecha_hora', 'asc')->get();
    }

    /**
     * Crear un nuevo recordatorio comercial para un lead.
     */
    public function crear(array $datos, int $idUsuario): Recordatorio
    {
        $recordatorio = Recordatorio::create([
            'id_lead' => $datos['id_lead'],
            'id_usuario' => $idUsuario,
            'fecha_hora' => $datos['fecha_hora'],
            'descripcion' => $datos['descripcion'],
            'estado' => 'PENDIENTE',
        ]);

        BitacoraService::registrar(
            $datos['id_lead'],
            'NOTA',
            "Recordatorio agendado para " . $recordatorio->fecha_hora->format('d/m/Y H:i') . ": {$recordatorio->descripcion}",
            $idUsuario
        );

        return $recordatorio;
    }

    /**
     * Marcar un recordatorio como completado o cancelado.
     */
    public function cambiarEstado(Recordatorio $recordatorio, string $nuevoEstado, int $idUsuario): Recordatorio
    {
        $recordatorio->update(['estado' => $nuevoEstado]);

        BitacoraService::registrar(
            $recordatorio->id_lead,
            'NOTA',
            "Recordatorio marcado como {$nuevoEstado}: {$recordatorio->descripcion}",
            $idUsuario
        );

        return $recordatorio;
    }
}
