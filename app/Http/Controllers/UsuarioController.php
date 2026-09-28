<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Rol;
use App\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(Request $request): Response
    {
        $filtros = $request->only(['search', 'id_rol', 'activo']);
        $usuarios = $this->userService->listar($filtros, 10);
        $roles = Rol::orderBy('id_rol')->get();

        return Inertia::render('Users/Index', [
            'usuarios' => $usuarios,
            'roles' => $roles,
            'filters' => $filtros,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->crear($request->validated());

        return redirect()->route('usuarios.index')->with('success', 'Usuario creado exitosamente.');
    }

    public function update(UpdateUserRequest $request, int $id): RedirectResponse
    {
        $datos = $request->validated();

        if (auth()->id() === $id && isset($datos['activo']) && ! $datos['activo']) {
            return redirect()->route('usuarios.index')->with('error', 'El administrador no puede bloquearse a sí mismo o desactivar su cuenta.');
        }

        $this->userService->actualizar($id, $datos);

        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function toggleStatus(int $id): RedirectResponse
    {
        if (auth()->id() === $id) {
            return redirect()->route('usuarios.index')->with('error', 'El administrador no puede bloquearse a sí mismo o desactivar su cuenta.');
        }

        $usuario = $this->userService->toggleActivo($id);
        $estado = $usuario->activo ? 'activado' : 'desactivado';

        return redirect()->route('usuarios.index')->with('success', "Usuario {$estado} correctamente.");
    }

    public function toggleRoundRobin(int $id): RedirectResponse
    {
        $usuario = $this->userService->toggleRoundRobin($id);
        $estado = $usuario->participa_round_robin ? 'incorporado al' : 'excluido del';

        return redirect()->route('usuarios.index')->with('success', "Vendedor {$estado} reparto Round-Robin.");
    }
}
