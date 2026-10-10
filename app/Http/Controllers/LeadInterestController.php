<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadInteres;
use App\Services\CatalogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeadInterestController extends Controller
{
    protected CatalogService $catalogService;

    public function __construct(CatalogService $catalogService)
    {
        $this->catalogService =$catalogService;
    }

    /**
     * Muestra los intereses asociados a un lead específico.
     */
    public function index(int $id): Response
    {
        $lead = Lead::with('intereses')->findOrFail($id);

        return Inertia::render('Leads/Intereses/Index', [
            'lead' => $lead,
            'intereses' => $lead->intereses,
        ]);
    }

    /**
     * Registra un nuevo interés para el lead (Programa o Módulo del Proyecto 2).
     */
    public function store(Request $request, int$id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);

        // 1. Validación estricta según las reglas del modelo y la BD
        $validated =$request->validate([
            'id_lead' => 'nullable|integer|in:'.$id,
            'tipo' => 'required|in:PROGRAMA,MODULO',
            'id_version_externo' => 'nullable|required_if:tipo,PROGRAMA|integer',
            'id_modulo_externo' => 'nullable|required_if:tipo,MODULO|integer',
            'nombre_snapshot' => 'nullable|string|max:150',
        ]);

        // 2. Consumimos el catálogo mediante el servicio proxy para calcular el snapshot
        $catalogo = $this->catalogService->getCatalogCompleto();
        $nombreSnapshot = $validated['nombre_snapshot'] ?? 'Interés Externo General';

        if ($validated['tipo'] === 'PROGRAMA') {
            $idVersion =$validated['id_version_externo'];
            foreach ($catalogo['programas'] ?? [] as$programa) {
                foreach ($programa['versiones'] ?? [] as$version) {
                    if ($version['id'] ==$idVersion) {
                        $nombreSnapshot = ($programa['nombre'] ?? 'Programa') . ' - ' . ($version['nombre'] ?? "Versión {$idVersion}");
                        break 2;
                    }
                }
            }
        } else {
            $idModulo =$validated['id_modulo_externo'];
            foreach ($catalogo['modulos_sueltos'] ?? [] as$modulo) {
                if ($modulo['id'] == $idModulo) {$nombreSnapshot = $modulo['nombre'] ?? "Módulo {$idModulo}";
                    break;
                }
            }
        }

        // 3. Persistencia en la tabla `lead_interes`
        LeadInteres::create([
            'id_lead' => $lead->id_lead,
            'tipo' => $validated['tipo'],
            'id_version_externo' => $validated['tipo'] === 'PROGRAMA' ?$validated['id_version_externo'] : null,
            'id_modulo_externo' => $validated['tipo'] === 'MODULO' ?$validated['id_modulo_externo'] : null,
            'nombre_snapshot' => $nombreSnapshot,
        ]);

        return redirect()->back()->with('success', 'Interés académico vinculado correctamente.');
    }

    /**
     * Elimina un interés vinculado al lead.
     */
    public function destroy(int $id, int$interesId): RedirectResponse
    {
        $interes = LeadInteres::where('id_interes',$interesId)
            ->where('id_lead', $id)
            ->findOrFail();

        $interes->delete();

        return redirect()->back()->with('success', 'Interés eliminado correctamente.');
    }
}