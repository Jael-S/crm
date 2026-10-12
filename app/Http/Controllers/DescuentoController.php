<?php

namespace App\Http\Controllers;

use App\Models\Descuento;
use App\Services\DescuentoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DescuentoController extends Controller
{
    public function __construct(
        protected DescuentoService $descuentoService
    ) {}

    public function index(): Response
    {
        $descuentos = $this->descuentoService->listarTodos();

        return Inertia::render('Descuentos/Index', [
            'descuentos' => $descuentos,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'porcentaje' => 'required|numeric|min:0.01|max:100',
            'descripcion' => 'nullable|string|max:255',
            'activo' => 'boolean',
        ]);

        $this->descuentoService->crear($validated);

        return redirect()->back()->with('success', 'Descuento comercial creado exitosamente.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $descuento = Descuento::findOrFail($id);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'porcentaje' => 'required|numeric|min:0.01|max:100',
            'descripcion' => 'nullable|string|max:255',
            'activo' => 'boolean',
        ]);

        $this->descuentoService->actualizar($descuento, $validated);

        return redirect()->back()->with('success', 'Descuento actualizado exitosamente.');
    }

    public function toggle(int $id): RedirectResponse
    {
        $descuento = Descuento::findOrFail($id);
        $this->descuentoService->toggleActivo($descuento);

        return redirect()->back()->with('success', 'Estado del descuento modificado.');
    }
}
