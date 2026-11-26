<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLeadRequest;
use App\Http\Requests\UpdateLeadRequest;
use App\Models\EtapaPipeline;
use App\Models\Lead;
use App\Models\LeadInteres;
use App\Models\OrigenLead;
use App\Models\Profesion;
use App\Models\Descuento;
use App\Models\Usuario;
use App\Services\LeadService;
use App\Services\CatalogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function __construct(
        protected LeadService $leadService,
        protected CatalogService $catalogService
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
        $profesiones = Profesion::orderBy('nombre')->get();
        $descuentos = Descuento::activos()->orderBy('nombre')->get();
        $vendedores = Usuario::where('activo', true)
            ->whereHas('rol', fn ($q) => $q->where('nombre', 'Vendedor'))
            ->orderBy('nombre_completo')
            ->get(['id_usuario', 'nombre_completo']);

        return Inertia::render('Leads/Create', [
            'origenes' => $origenes,
            'profesiones' => $profesiones,
            'descuentos' => $descuentos,
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
     * Ver ficha detallada del prospecto con detección de Ex-Alumno y Múltiples Intereses.
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

        $exAlumnoInfo = $this->obtenerInfoExAlumno($lead);

        return Inertia::render('Leads/Show', [
            'lead' => $lead->load([
                'intereses.descuento',
                'profesion',
                'descuento',
                'bitacoras.usuario',
                'bitacoras.etapaAnterior',
                'bitacoras.etapaNueva',
                'recordatorios.usuario',
                'comprobantes.subidoPor',
                'comprobantes.revisadoPor',
                'comprobantes.interes',
                'comprobantes.envioMatricula',
                'enviosMatricula.interes',
            ]),
            'vendedores' => $vendedores,
            'descuentos' => Descuento::activos()->orderBy('nombre')->get(),
            'catalogo' => $this->catalogService->getCatalogCompleto(),
            'ex_alumno_info' => $exAlumnoInfo,
        ]);
    }

    /**
     * Detección de Ex-Alumno y Reingresos (buscar por CI o Correo en otros leads con cursos MATRICULADOS).
     */
    public function obtenerInfoExAlumno(Lead $lead): array
    {
        $historialPrevio = LeadInteres::where('id_lead', '!=', $lead->id_lead)
            ->where('estado', 'MATRICULADO')
            ->whereHas('lead', function ($q) use ($lead) {
                $q->where(function ($sub) use ($lead) {
                    if (!empty($lead->ci)) {
                        $sub->where('ci', $lead->ci);
                    }
                    if (!empty($lead->correo)) {
                        $sub->orWhere('correo', $lead->correo);
                    }
                });
            })
            ->with('lead')
            ->get();

        $descuentoFidelidad = Descuento::where('activo', true)
            ->where(function ($q) {
                $q->where('nombre', 'ilike', '%fidelidad%')
                  ->orWhere('nombre', 'ilike', '%ex-alumno%')
                  ->orWhere('nombre', 'ilike', '%exalumno%')
                  ->orWhere('nombre', 'ilike', '%convenio%');
            })
            ->first();

        return [
            'es_ex_alumno' => $historialPrevio->isNotEmpty(),
            'total_cursos_concluidos' => $historialPrevio->count(),
            'cursos_previos' => $historialPrevio->map(fn ($i) => [
                'id_interes' => $i->id_interes,
                'nombre' => $i->nombre_snapshot,
                'curso' => $i->nombre_snapshot,
                'tipo' => $i->tipo,
                'lead_id' => $i->id_lead,
                'fecha_matricula' => $i->updated_at?->format('d/m/Y') ?? 'Anterior',
            ])->toArray(),
            'descuento_sugerido' => $descuentoFidelidad ? [
                'id_descuento' => $descuentoFidelidad->id_descuento,
                'nombre' => $descuentoFidelidad->nombre,
                'porcentaje' => $descuentoFidelidad->porcentaje,
                'monto_fijo' => $descuentoFidelidad->monto_fijo,
            ] : null,
        ];
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
        $profesiones = Profesion::orderBy('nombre')->get();
        $descuentos = Descuento::activos()->orderBy('nombre')->get();

        return Inertia::render('Leads/Edit', [
            'lead' => $lead->load(['profesion', 'descuento']),
            'origenes' => $origenes,
            'etapas' => $etapas,
            'profesiones' => $profesiones,
            'descuentos' => $descuentos,
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

    /**
     * Búsqueda global predictiva en el Header (Requisito Evans).
     */
    public function globalSearch(Request $request): \Illuminate\Http\JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if (strlen($q) < 2) {
            return response()->json(['results' => []]);
        }

        $user = $request->user();
        $query = Lead::query();

        if ($user->isVendedor()) {
            $query->where(function ($sub) use ($user) {
                $sub->where('id_vendedor', $user->id_usuario)
                    ->orWhereNull('id_vendedor');
            });
        }

        $results = $query->where(function ($sub) use ($q) {
            $sub->where('nombre', 'ilike', "%{$q}%")
                ->orWhere('correo', 'ilike', "%{$q}%")
                ->orWhere('ci', 'ilike', "%{$q}%")
                ->orWhere('telefono', 'ilike', "%{$q}%");
        })
        ->with(['etapa', 'vendedor'])
        ->limit(6)
        ->get(['id_lead', 'nombre', 'correo', 'ci', 'telefono', 'id_etapa', 'id_vendedor'])
        ->map(fn ($lead) => [
            'id' => $lead->id_lead,
            'nombre' => $lead->nombre,
            'ci' => $lead->ci,
            'correo' => $lead->correo,
            'telefono' => $lead->telefono,
            'etapa' => $lead->etapa?->nombre ?? 'Sin etapa',
            'url' => "/leads/{$lead->id_lead}",
        ]);

        return response()->json(['results' => $results]);
    }
}
