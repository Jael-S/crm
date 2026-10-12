<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStageRequest;
use App\Models\Lead;
use App\Models\MotivoPerdida;
use App\Models\Usuario;
use App\Services\PipelineService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PipelineController extends Controller
{
    public function __construct(
        protected PipelineService $pipelineService,
        protected \App\Services\CatalogService $catalogService
    ) {}

    /**
     * Muestra el tablero Kanban con las 6 columnas y prospectos.
     */
    public function board(Request $request): Response
    {
        $user = $request->user();
        $filtros = $request->only(['search', 'id_vendedor']);

        $tablero = $this->pipelineService->obtenerTablero($user, $filtros);
        $motivosPerdida = MotivoPerdida::orderBy('nombre')->get();

        $vendedores = [];
        if ($user->isAdmin() || $user->isCoordinador()) {
            $vendedores = Usuario::where('activo', true)
                ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
                ->orderBy('nombre_completo')
                ->get(['id_usuario', 'nombre_completo']);
        }

        return Inertia::render('Pipeline/Kanban', [
            'columnas' => $tablero['columnas'],
            'totalLeads' => $tablero['total_leads'],
            'motivosPerdida' => $motivosPerdida,
            'vendedores' => $vendedores,
            'filters' => $filtros,
            'catalogo' => $this->catalogService->getCatalogCompleto(),
        ]);
    }

    /**
     * Cambia de etapa a un prospecto aplicando reglas de negocio y bitácora.
     */
    public function changeStage(UpdateStageRequest $request, int $id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);
        $user = $request->user();

        // Control de permisos para Vendedor: solo puede mover sus propios leads
        if ($user->isVendedor() && $lead->id_vendedor !== $user->id_usuario) {
            abort(403, 'No tiene autorización para cambiar la etapa de un prospecto ajeno.');
        }

        $this->pipelineService->cambiarEtapa(
            $lead,
            (int) $request->input('id_etapa'),
            $request->validated(),
            $user
        );

        return redirect()->back()->with('success', 'Etapa del prospecto actualizada con éxito.');
    }
}
