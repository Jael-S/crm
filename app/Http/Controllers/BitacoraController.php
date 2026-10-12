<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\Lead;
use App\Services\BitacoraService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BitacoraController extends Controller
{
    public function __construct(
        protected BitacoraService $bitacoraService
    ) {}

    public function timeline(int $id): Response
    {
        $lead = Lead::findOrFail($id);
        $eventos = $this->bitacoraService->obtenerHistorial($id);

        return Inertia::render('Bitacora/Timeline', [
            'lead' => $lead,
            'eventos' => $eventos,
        ]);
    }

    public function addNote(Request $request, int $id): RedirectResponse
    {
        $request->validate([
            'descripcion' => 'required|string|max:1000',
        ]);

        BitacoraService::registrar(
            $id,
            'NOTA',
            $request->input('descripcion'),
            $request->user()->id_usuario
        );

        return redirect()->back()->with('success', 'Nota registrada en la bitácora del prospecto.');
    }
}
