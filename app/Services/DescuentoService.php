<?php

namespace App\Services;

use App\Models\Descuento;
use Illuminate\Database\Eloquent\Collection;

class DescuentoService
{
    public function listarTodos(): Collection
    {
        return Descuento::withCount('leads')->orderBy('nombre', 'asc')->get();
    }

    public function listarActivos(): Collection
    {
        return Descuento::activos()->orderBy('porcentaje', 'desc')->get();
    }

    public function crear(array $datos): Descuento
    {
        return Descuento::create([
            'nombre' => $datos['nombre'],
            'porcentaje' => $datos['porcentaje'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => $datos['activo'] ?? true,
        ]);
    }

    public function actualizar(Descuento $descuento, array $datos): Descuento
    {
        $descuento->update([
            'nombre' => $datos['nombre'],
            'porcentaje' => $datos['porcentaje'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => $datos['activo'] ?? true,
        ]);

        return $descuento;
    }

    public function toggleActivo(Descuento $descuento): Descuento
    {
        $descuento->update(['activo' => !$descuento->activo]);
        return $descuento;
    }
}
