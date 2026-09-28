<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function listar(array $filtros = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Usuario::with('rol')->orderBy('id_usuario', 'asc');

        if (! empty($filtros['search'])) {
            $search = trim($filtros['search']);
            $query->where(function ($q) use ($search) {
                $q->where('nombre_completo', 'ilike', "%{$search}%")
                  ->orWhere('correo', 'ilike', "%{$search}%");
            });
        }

        if (! empty($filtros['id_rol'])) {
            $query->where('id_rol', $filtros['id_rol']);
        }

        if (isset($filtros['activo']) && $filtros['activo'] !== '') {
            $query->where('activo', filter_var($filtros['activo'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function crear(array $datos): Usuario
    {
        return Usuario::create([
            'nombre_completo' => $datos['nombre_completo'],
            'correo' => strtolower(trim($datos['correo'])),
            'id_rol' => $datos['id_rol'],
            'password_hash' => Hash::make($datos['password']),
            'activo' => $datos['activo'] ?? true,
            'participa_round_robin' => $datos['participa_round_robin'] ?? ($datos['id_rol'] == 3),
        ]);
    }

    public function actualizar(int $id, array $datos): Usuario
    {
        $usuario = Usuario::findOrFail($id);

        $payload = [
            'nombre_completo' => $datos['nombre_completo'],
            'correo' => strtolower(trim($datos['correo'])),
            'id_rol' => $datos['id_rol'],
            'activo' => $datos['activo'] ?? $usuario->activo,
            'participa_round_robin' => $datos['participa_round_robin'] ?? $usuario->participa_round_robin,
        ];

        if (! empty($datos['password'])) {
            $payload['password_hash'] = Hash::make($datos['password']);
        }

        $usuario->update($payload);

        return $usuario;
    }

    public function toggleActivo(int $id): Usuario
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->activo = ! $usuario->activo;
        $usuario->save();

        return $usuario;
    }

    public function toggleRoundRobin(int $id): Usuario
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->participa_round_robin = ! $usuario->participa_round_robin;
        $usuario->save();

        return $usuario;
    }
}
