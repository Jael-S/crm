<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\LeadInteres;
use App\Models\Descuento;
use App\Services\CatalogService;
use App\Services\BitacoraService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeadInterestController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService
    ) {}

    /**
     * Muestra los intereses asociados a un lead específico.
     */
    public function index(int $id): Response
    {
        $lead = Lead::with(['intereses.descuento'])->findOrFail($id);

        return Inertia::render('Leads/Intereses/Index', [
            'lead' => $lead,
            'intereses' => $lead->intereses,
        ]);
    }

    /**
     * Registra un nuevo interés para el lead (Programa o Módulo del Proyecto 2).
     */
    public function store(Request $request, int $id): RedirectResponse
    {
        $lead = Lead::findOrFail($id);

        // 1. Validación estricta según las reglas del modelo y la BD
        $validated = $request->validate([
            'id_lead' => 'nullable|integer|in:' . $id,
            'tipo' => 'required|in:PROGRAMA,MODULO',
            'id_version_externo' => 'nullable|required_if:tipo,PROGRAMA|integer',
            'id_modulo_externo' => 'nullable|required_if:tipo,MODULO|integer',
            'nombre_snapshot' => 'nullable|string|max:150',
            'monto_pactado' => 'nullable|numeric|min:0',
            'id_descuento' => 'nullable|integer|exists:descuentos,id_descuento',
        ]);

        // 2. Consumimos el catálogo mediante el servicio proxy para calcular el snapshot y precio de lista
        $catalogo = $this->catalogService->getCatalogCompleto();
        $nombreSnapshot = $validated['nombre_snapshot'] ?? 'Interés Académico General';
        $precioLista = null;

        if ($validated['tipo'] === 'PROGRAMA') {
            $idVersion = $validated['id_version_externo'];
            foreach ($catalogo['programas'] ?? [] as $programa) {
                foreach ($programa['versiones'] ?? [] as $version) {
                    if ($version['id'] == $idVersion) {
                        $nombreSnapshot = ($programa['nombre'] ?? 'Programa') . ' - ' . ($version['nombre'] ?? "Versión {$idVersion}");
                        $precioLista = isset($version['precio']) ? (float) $version['precio'] : null;
                        break 2;
                    }
                }
            }
        } else {
            $idModulo = $validated['id_modulo_externo'];
            foreach ($catalogo['modulos_sueltos'] ?? [] as $modulo) {
                if ($modulo['id'] == $idModulo) {
                    $nombreSnapshot = $modulo['nombre'] ?? "Módulo {$idModulo}";
                    $precioLista = isset($modulo['precio']) ? (float) $modulo['precio'] : null;
                    break;
                }
            }
        }

        // Si no vino monto_pactado pero tenemos precio de lista, calcular considerando descuento si existe
        $montoFinal = $validated['monto_pactado'] ?? $precioLista;
        if (!empty($validated['id_descuento']) && $precioLista) {
            $descuento = Descuento::find($validated['id_descuento']);
            if ($descuento && $descuento->activo) {
                if ($descuento->tipo === 'MONTO_FIJO' && $descuento->monto_fijo) {
                    $montoFinal = max(0, $precioLista - (float) $descuento->monto_fijo);
                } elseif ($descuento->porcentaje) {
                    $montoFinal = max(0, $precioLista * (1 - ((float) $descuento->porcentaje / 100)));
                }
            }
        }

        // 3. Persistencia en la tabla `lead_interes`
        $interes = LeadInteres::create([
            'id_lead' => $lead->id_lead,
            'tipo' => $validated['tipo'],
            'id_version_externo' => $validated['tipo'] === 'PROGRAMA' ? $validated['id_version_externo'] : null,
            'id_modulo_externo' => $validated['tipo'] === 'MODULO' ? $validated['id_modulo_externo'] : null,
            'nombre_snapshot' => $nombreSnapshot,
            'estado' => 'EN_SEGUIMIENTO',
            'monto_pactado' => $montoFinal,
            'id_descuento' => $validated['id_descuento'] ?? null,
        ]);

        BitacoraService::registrar(
            $lead->id_lead,
            'NOTA',
            "Nuevo interés vinculado: '{$nombreSnapshot}'" . ($montoFinal ? " (Monto pactado: Bs. {$montoFinal})" : ""),
            $request->user()->id_usuario
        );

        return redirect()->back()->with('success', 'Interés académico vinculado correctamente.');
    }

    /**
     * Elimina un interés vinculado al lead.
     */
    public function destroy(int $id, int $interesId): RedirectResponse
    {
        $interes = LeadInteres::where('id_interes', $interesId)
            ->where('id_lead', $id)
            ->firstOrFail();

        $nombre = $interes->nombre_snapshot;
        $interes->delete();

        BitacoraService::registrar(
            $id,
            'NOTA',
            "Interés académico '{$nombre}' eliminado de la ficha del prospecto",
            auth()->id()
        );

        return redirect()->back()->with('success', 'Interés eliminado correctamente.');
    }
}
