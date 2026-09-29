<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\OrigenLead;
use App\Models\Usuario;
use App\Services\LeadService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(
        protected LeadService $leadService
    ) {}

    /**
     * Listado general de prospectos según el alcance del usuario.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $request->only(['search', 'id_etapa', 'id_origen', 'id_vendedor']);

        $leads = $this->leadService->listar($user, $filters);
        $origenes = OrigenLead::orderBy('nombre')->get();
        $etapas = EtapaPipeline::orderBy('orden')->get();
        
        $vendedores = [];
        if ($user->isAdmin() || $user->isCoordinador()) {
            $vendedores = Usuario::where('activo', true)
                ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
                ->orderBy('nombre_completo')
                ->get(['id_usuario', 'nombre_completo']);
        }

        return Inertia::render('Leads/Index', [
            'leads' => $leads,
            'filters' => $filters,
            'origenes' => $origenes,
            'etapas' => $etapas,
            'vendedores' => $vendedores,
        ]);
    }

    /**
     * Formulario para crear un nuevo prospecto.
     */
    public function create(Request $request): Response
    {
        $origenes = OrigenLead::orderBy('nombre')->get();
        $vendedores = Usuario::where('activo', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
            ->orderBy('nombre_completo')
            ->get(['id_usuario', 'nombre_completo']);

        return Inertia::render('Leads/Create', [
            'origenes' => $origenes,
            'vendedores' => $vendedores,
        ]);
    }

    /**
     * Guardar el nuevo prospecto.
     */
    public function store(StoreLeadRequest $request): RedirectResponse
    {
        $lead = $this->leadService->crear($request->validated(), $request->user()->id_usuario);

        return redirect()->route('leads.show', $lead->id_lead)
            ->with('success', 'Prospecto registrado exitosamente.');
    }

    /**
     * Ver ficha detallada del prospecto.
     */
    public function show(Request $request, int $id): Response
    {
        $lead = $this->leadService->obtenerPorId($id);
        $user = $request->user();

        // Control de alcance para vendedores
        if ($user->isVendedor() && $lead->id_vendedor !== $user->id_usuario && !$lead->esBolsaComun()) {
            abort(403, 'No tiene autorización para visualizar este prospecto.');
        }

        $vendedores = Usuario::where('activo', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
            ->orderBy('nombre_completo')
            ->get(['id_usuario', 'nombre_completo']);

        return Inertia::render('Leads/Show', [
            'lead' => $lead,
            'vendedores' => $vendedores,
        ]);
    }

    /**
     * Formulario de edición del prospecto.
     */
    public function edit(Request $request, int $id): Response
    {
        $lead = $this->leadService->obtenerPorId($id);
        $user = $request->user();

        if ($user->isVendedor() && $lead->id_vendedor !== $user->id_usuario) {
            abort(403, 'No tiene autorización para modificar este prospecto.');
        }

        $origenes = OrigenLead::orderBy('nombre')->get();
        $etapas = EtapaPipeline::orderBy('orden')->get();

        return Inertia::render('Leads/Edit', [
            'lead' => $lead,
            'origenes' => $origenes,
            'etapas' => $etapas,
        ]);
    }

    /**
     * Actualizar los datos del prospecto.
     */
    public function update(UpdateLeadRequest $request, int $id): RedirectResponse
    {
        $lead = $this->leadService->obtenerPorId($id);
        $user = $request->user();

        if ($user->isVendedor() && $lead->id_vendedor !== $user->id_usuario) {
            abort(403, 'No tiene autorización para modificar este prospecto.');
        }

        $this->leadService->actualizar($lead, $request->validated());

        return redirect()->route('leads.show', $lead->id_lead)
            ->with('success', 'Prospecto actualizado correctamente.');
    }

    /**
     * Vista de la Bolsa Común (prospectos sin vendedor).
     */
    public function pool(Request $request): Response
    {
        $filters = $request->only(['search', 'id_origen']);
        $leads = $this->leadService->listarBolsaComun($filters);
        $origenes = OrigenLead::orderBy('nombre')->get();
        
        $vendedores = Usuario::where('activo', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
            ->orderBy('nombre_completo')
            ->get(['id_usuario', 'nombre_completo']);

        return Inertia::render('Leads/Pool', [
            'leads' => $leads,
            'filters' => $filters,
            'origenes' => $origenes,
            'vendedores' => $vendedores,
        ]);
    }
}
