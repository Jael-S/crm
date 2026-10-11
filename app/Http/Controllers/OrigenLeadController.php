<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrigenLeadRequest;
use App\Http\Requests\UpdateOrigenLeadRequest;
use App\Models\OrigenLead;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrigenLeadController extends Controller
{
    /**
     * Listado de canales de origen con el conteo de prospectos asociados.
     */
    public function index(): Response
    {
        $origenes = OrigenLead::withCount('leads')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Origenes/Index', [
            'origenes' => $origenes,
        ]);
    }

    /**
     * Registrar nuevo canal de origen.
     */
    public function store(StoreOrigenLeadRequest $request): RedirectResponse
    {
        OrigenLead::create($request->validated());

        return redirect()->back()->with('success', 'Canal de origen creado exitosamente.');
    }

    /**
     * Actualizar el nombre de un canal de origen.
     */
    public function update(UpdateOrigenLeadRequest $request, int $id): RedirectResponse
    {
        $origen = OrigenLead::findOrFail($id);
        $origen->update($request->validated());

        return redirect()->back()->with('success', 'Canal de origen actualizado correctamente.');
    }

    /**
     * Eliminar canal de origen con validación defensiva de integridad referencial.
     */
    public function destroy(int $id): RedirectResponse
    {
        $origen = OrigenLead::withCount('leads')->findOrFail($id);

        if ($origen->leads_count > 0) {
            return redirect()->back()->with(
                'error',
                "No se puede eliminar el origen '{$origen->nombre}' porque tiene {$origen->leads_count} prospectos asociados."
            );
        }

        $origen->delete();

        return redirect()->back()->with('success', 'Canal de origen eliminado correctamente.');
    }
}
