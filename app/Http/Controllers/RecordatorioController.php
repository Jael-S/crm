<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Recordatorio;
use App\Services\RecordatorioService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecordatorioController extends Controller
{
    public function __construct(
        protected RecordatorioService $recordatorioService
    ) {}

    public function index(Request $request): Response
    {
        $recordatorios = $this->recordatorioService->listarPorUsuario($request->user());

        return Inertia::render('Recordatorios/Index', [
            'recordatorios' => $recordatorios,
        ]);
    }

    public function store(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'fecha_hora' => 'required|date|after_or_equal:now',
            'descripcion' => 'required|string|max:255',
        ]);

        $validated['id_lead'] = $id;

        $this->recordatorioService->crear($validated, $request->user()->id_usuario);

        return redirect()->back()->with('success', 'Recordatorio agendado exitosamente.');
    }

    public function completar(int $id, Request $request): RedirectResponse
    {
        $recordatorio = Recordatorio::findOrFail($id);
        $this->recordatorioService->cambiarEstado($recordatorio, 'COMPLETADO', $request->user()->id_usuario);

        return redirect()->back()->with('success', 'Recordatorio marcado como completado.');
    }
}
