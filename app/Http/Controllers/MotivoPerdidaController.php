<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMotivoPerdidaRequest;
use App\Http\Requests\UpdateMotivoPerdidaRequest;
use App\Models\MotivoPerdida;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MotivoPerdidaController extends Controller
{
    /**
     * Listado de motivos de pérdida con conteo de prospectos descartados asociados.
     */
    public function index(): Response
    {
        $motivos = MotivoPerdida::withCount('leads')
            ->orderBy('id_motivo', 'asc')
            ->get();

        return Inertia::render('MotivosPerdida/Index', [
            'motivos' => $motivos,
        ]);
    }

    /**
     * Registrar un nuevo motivo de descarte/pérdida.
     */
    public function store(StoreMotivoPerdidaRequest $request): RedirectResponse
    {
        MotivoPerdida::create($request->validated());

        return redirect()->back()->with('success', 'Motivo de pérdida registrado exitosamente.');
    }

    /**
     * Actualizar el nombre de un motivo de pérdida existente.
     */
    public function update(UpdateMotivoPerdidaRequest $request, int $id): RedirectResponse
    {
        $motivo = MotivoPerdida::findOrFail($id);
        $motivo->update($request->validated());

        return redirect()->back()->with('success', 'Motivo de pérdida actualizado correctamente.');
    }

    /**
     * Eliminar motivo de pérdida con protección defensiva de integridad referencial.
     */
    public function destroy(int $id): RedirectResponse
    {
        $motivo = MotivoPerdida::withCount('leads')->findOrFail($id);

        if ($motivo->leads_count > 0) {
            return redirect()->back()->with(
                'error',
                "No es posible eliminar el motivo '{$motivo->nombre}' porque se encuentra asignado a {$motivo->leads_count} prospecto(s) en la etapa de Perdidos."
            );
        }

        $motivo->delete();

        return redirect()->back()->with('success', 'Motivo de pérdida eliminado correctamente.');
    }
}
