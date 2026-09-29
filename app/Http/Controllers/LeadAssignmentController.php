<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignLeadRequest;
use App\Http\Requests\RoundRobinAssignRequest;
use App\Models\Lead;
use App\Services\AssignmentService;
use App\Services\RoundRobinService;
use Exception;
use Illuminate\Http\RedirectResponse;

class LeadAssignmentController extends Controller
{
    public function __construct(
        protected AssignmentService $assignmentService,
        protected RoundRobinService $roundRobinService
    ) {}

    /**
     * Asignar manualmente un prospecto a un vendedor.
     * Requerimiento RF2.3 (Ing. Miriam): Admin y Coordinador.
     */
    public function assign(AssignLeadRequest $request, int $id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);
        $idVendedorNuevo = (int) $request->validated('id_vendedor');

        $this->assignmentService->asignarManual(
            $lead,
            $idVendedorNuevo,
            $request->user()->id_usuario
        );

        return back()->with('success', 'Prospecto asignado exitosamente.');
    }

    /**
     * Transferir un prospecto a otro asesor con motivo.
     * Requerimiento RF2.3 (Ing. Miriam): Admin y Coordinador.
     */
    public function transfer(AssignLeadRequest $request, int $id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);
        $idVendedorNuevo = (int) $request->validated('id_vendedor');
        $motivo = $request->validated('motivo') ?: 'Transferencia manual de prospecto';

        $this->assignmentService->transferir(
            $lead,
            $idVendedorNuevo,
            $motivo,
            $request->user()->id_usuario
        );

        return back()->with('success', 'Prospecto transferido exitosamente.');
    }

    /**
     * Distribución automática masiva por Round-Robin.
     * Exclusivo Administrador.
     */
    public function roundRobin(RoundRobinAssignRequest $request): RedirectResponse
    {
        $leadIds = $request->validated('lead_ids') ?? [];

        try {
            $resultado = $this->roundRobinService->distribuir(
                $leadIds,
                $request->user()->id_usuario
            );

            return back()->with('success', $resultado['mensaje']);
        } catch (Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
