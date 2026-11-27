<?php

namespace App\Http\Controllers;

use App\Models\Bitacora;
use App\Models\Descuento;
use App\Models\Lead;
use App\Models\LeadInteres;
use App\Models\OrigenLead;
use App\Models\Profesion;
use App\Models\Usuario;
use App\Services\CatalogService;
use App\Services\RoundRobinService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class PublicRegistrationController extends Controller
{
    public function __construct(
        protected CatalogService $catalogService,
        protected RoundRobinService $roundRobinService
    ) {}

    /**
     * Muestra el Landing Page corporativo de UNEXO en la raíz (/).
     */
    public function landing(): Response
    {
        $catalogo = $this->obtenerCatalogoConFallbacks();
        $descuentos = Descuento::activos()->orderBy('porcentaje', 'desc')->get();
        $profesiones = Profesion::orderBy('nombre')->get(['id_profesion', 'nombre']);

        return Inertia::render('Landing', [
            'programas' => $catalogo['programas'],
            'modulos' => $catalogo['modulos'],
            'descuentos' => $descuentos,
            'profesiones' => $profesiones,
        ]);
    }

    /**
     * Muestra la vista dedicada del formulario de registro (/registro).
     */
    public function showForm(): Response
    {
        $catalogo = $this->obtenerCatalogoConFallbacks();
        $descuentos = Descuento::activos()->orderBy('porcentaje', 'desc')->get();
        $profesiones = Profesion::orderBy('nombre')->get(['id_profesion', 'nombre']);

        return Inertia::render('PublicRegistration', [
            'programas' => $catalogo['programas'],
            'modulos' => $catalogo['modulos'],
            'descuentos' => $descuentos,
            'profesiones' => $profesiones,
        ]);
    }

    /**
     * Procesa la postulación pública de un prospecto.
     */
    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'min:3', 'max:120'],
            'telefono' => ['required', 'string', 'min:7', 'max:25'],
            'correo' => ['nullable', 'email', 'max:100'],
            'ciudad' => ['required', 'string', 'min:2', 'max:80'],
            'id_profesion' => ['nullable', 'integer', 'exists:profesiones,id_profesion'],
            'programa' => ['required', 'string', 'max:150'],
            'id_interes_externo' => ['nullable', 'integer'],
            'tipo_item' => ['nullable', 'string', 'in:PROGRAMA,MODULO,CURSO'],
            'precio' => ['nullable', 'numeric', 'min:0'],
            'mensaje' => ['nullable', 'string', 'max:500'],
        ], [
            'nombre.required' => 'El nombre completo es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'telefono.required' => 'El número de teléfono o WhatsApp es obligatorio.',
            'ciudad.required' => 'La ciudad de residencia es obligatoria.',
            'programa.required' => 'Seleccione un programa de interés.',
        ]);

        $asesorAsignado = null;

        try {
            DB::transaction(function () use ($validated, &$asesorAsignado) {
                // 1. Obtener o crear canal de origen 'Web' (ID 3)
                $origen = OrigenLead::where('nombre', 'ILIKE', 'Web')->first();
                $idOrigen = $origen ? $origen->id_origen : 3;

                // 2. Comprobar si ya existe un prospecto con el mismo teléfono
                $cleanPhone = preg_replace('/\D/', '', $validated['telefono']);
                $lead = Lead::where(function ($q) use ($validated, $cleanPhone) {
                    $q->where('telefono', $validated['telefono'])
                      ->orWhereRaw("REGEXP_REPLACE(telefono, '[^0-9]', '', 'g') = ?", [$cleanPhone]);
                    if (!empty($validated['correo'])) {
                        $q->orWhere('correo', $validated['correo']);
                    }
                })->first();

                $esNuevo = false;

                if (!$lead) {
                    $esNuevo = true;
                    // Crear nuevo Lead en etapa 'Nuevo' (ID 1)
                    $lead = Lead::create([
                        'nombre' => $validated['nombre'],
                        'telefono' => $validated['telefono'],
                        'correo' => $validated['correo'] ?? null,
                        'ciudad' => $validated['ciudad'],
                        'id_profesion' => $validated['id_profesion'] ?? null,
                        'id_origen' => $idOrigen,
                        'id_etapa' => 1, // Nuevo
                        'id_vendedor' => null, // Inicialmente en bolsa común para reparto
                        'created_by' => 1, // Admin sistema
                    ]);
                } else {
                    // Actualizar datos si viene información más completa
                    $updateData = [
                        'nombre' => $validated['nombre'] ?: $lead->nombre,
                        'ciudad' => $validated['ciudad'] ?: $lead->ciudad,
                        'correo' => $validated['correo'] ?: $lead->correo,
                    ];
                    if (!empty($validated['id_profesion'])) {
                        $updateData['id_profesion'] = $validated['id_profesion'];
                    }
                    $lead->update($updateData);
                }

                // 3. Registrar el Interés Académico
                $precio = !empty($validated['precio']) && $validated['precio'] > 0 ? (float) $validated['precio'] : 1200.00;
                
                LeadInteres::create([
                    'id_lead' => $lead->id_lead,
                    'tipo' => $validated['tipo_item'] ?? 'PROGRAMA',
                    'id_version_externo' => $validated['id_interes_externo'] ?? 1,
                    'nombre_snapshot' => $validated['programa'],
                    'monto_pactado' => $precio,
                    'estado' => 'INTERESADO',
                ]);

                // 4. Registrar en Bitácora (Permanece en Etapa 1 Nuevo, SIN vendedor asignado en Bolsa Común)
                Bitacora::create([
                    'id_lead' => $lead->id_lead,
                    'id_usuario' => 1,
                    'id_etapa_anterior' => null,
                    'id_etapa_nueva' => 1, // Etapa 1: Nuevo
                    'tipo' => 'NOTA',
                    'descripcion' => $esNuevo
                        ? "Postulación autónoma registrada desde el portal web en etapa 'Nuevo' (Bolsa Común, sin vendedor) para: {$validated['programa']}."
                        : "Nueva postulación registrada desde el portal web para programa adicional: {$validated['programa']}.",
                    'created_at' => now(),
                ]);
            });

            return redirect()->back()->with([
                'success' => '¡Tu postulación ha sido registrada con éxito en UNEXO FICCT! Tu solicitud ingresó a la plataforma y un asesor se pondrá en contacto contigo a la brevedad.',
            ]);

        } catch (\Throwable $e) {
            Log::error("[REGISTRO-PUBLICO] Error al registrar prospecto: " . $e->getMessage());
            return redirect()->back()->withErrors([
                'general' => 'Ocurrió un error al procesar tu postulación. Por favor intenta nuevamente o contáctanos por WhatsApp.',
            ]);
        }
    }

    /**
     * Obtiene programas y módulos habilitados consumiendo el catálogo oficial del Proyecto 2.
     * Filtra únicamente las ofertas que admiten inscripciones según las reglas de la plataforma.
     */
    protected function obtenerCatalogoConFallbacks(): array
    {
        $programasHabilitados = [];
        $modulosHabilitados = [];

        try {
            $cat = $this->catalogService->getCatalogCompleto();
            
            // 1. Programas: Únicamente aquellos con cohortes activas (versiones abiertas para inscripción)
            $programasRaw = $cat['programas'] ?? [];
            foreach ($programasRaw as $p) {
                $versiones = $p['versiones'] ?? [];
                if (!empty($versiones)) {
                    $cohorteActiva = $versiones[0];
                    $programasHabilitados[] = [
                        'id_item_externo' => $cohorteActiva['id'] ?? $p['id'],
                        'codigo' => $p['codigo'] ?? 'PRG',
                        'nombre' => $p['nombre'],
                        'tipo' => 'PROGRAMA',
                        'precio' => (float) ($p['precio_contado'] ?? 2600.00),
                        'descripcion' => $p['descripcion'] ?? 'Programa completo avalado por la FICCT.',
                        'modalidad' => 'Virtual / Presencial Módulo 236',
                        'duracion' => ($p['cantidad_modulos'] ?? count($p['modulos'] ?? [])) . ' Módulos Académicos',
                        'badge' => 'CONVOCATORIA ABIERTA',
                        'imagen' => '/images/landing/crm.jpg',
                        'cohorte_nombre' => $cohorteActiva['nombre'] ?? '',
                    ];
                }
            }

            // 2. Módulos sueltos: Únicamente aquellos con grupos activos (admite inscripciones)
            $modulosRaw = $cat['modulos_sueltos'] ?? [];
            $imgList = ['/images/landing/crm2.jpg', '/images/landing/crm3.jpg', '/images/landing/crm4.webp', '/images/landing/crm5.webp', '/images/landing/crm6.jpg'];
            foreach ($modulosRaw as $idx => $m) {
                $grupos = $m['grupos'] ?? [];
                if (!empty($grupos)) {
                    $grupoActivo = $grupos[0];
                    $modulosHabilitados[] = [
                        'id_item_externo' => $grupoActivo['id'] ?? $m['id'],
                        'codigo' => $m['codigo'] ?? 'MOD',
                        'nombre' => $m['nombre'],
                        'tipo' => 'MODULO',
                        'precio' => (float) ($m['precio'] ?? 650.00),
                        'descripcion' => $m['descripcion'] ?? 'Módulo independiente con certificación oficial FICCT.',
                        'modalidad' => 'Online Sincrónico',
                        'duracion' => ($m['horas'] ?? 20) . ' Horas',
                        'badge' => 'GRUPO HABILITADO',
                        'imagen' => $imgList[$idx % count($imgList)],
                        'grupo_nombre' => $grupoActivo['nombre'] ?? '',
                    ];
                }
            }
        } catch (\Throwable $e) {
            Log::warning("[LANDING] Error obteniendo catálogo externo: " . $e->getMessage());
        }

        // Fallbacks seguros de la FICCT en caso de indisponibilidad externa
        if (empty($programasHabilitados)) {
            $programasHabilitados = [
                [
                    'id_item_externo' => 1,
                    'codigo' => 'IAA-2026',
                    'nombre' => 'Inteligencia Artificial Aplicada',
                    'tipo' => 'PROGRAMA',
                    'precio' => 2600.00,
                    'descripcion' => 'Programa completo para aplicar IA en empresas: fundamentos, Python, Machine Learning e IA Generativa.',
                    'modalidad' => 'Virtual / Presencial Módulo 236',
                    'duracion' => '4 Módulos Académicos',
                    'badge' => 'CONVOCATORIA ABIERTA',
                    'imagen' => '/images/landing/crm.jpg',
                ],
            ];
        }

        if (empty($modulosHabilitados)) {
            $modulosHabilitados = [
                [
                    'id_item_externo' => 1,
                    'codigo' => 'IAA-01',
                    'nombre' => 'Fundamentos de Inteligencia Artificial',
                    'tipo' => 'MODULO',
                    'precio' => 650.00,
                    'descripcion' => 'Tipos de aprendizaje, casos de uso empresarial y conceptos nucleares.',
                    'modalidad' => 'Online Sincrónico',
                    'duracion' => '20 Horas',
                    'badge' => 'GRUPO HABILITADO',
                    'imagen' => '/images/landing/crm2.jpg',
                ],
                [
                    'id_item_externo' => 2,
                    'codigo' => 'IAA-02',
                    'nombre' => 'Python para IA',
                    'tipo' => 'MODULO',
                    'precio' => 650.00,
                    'descripcion' => 'Estructuras de datos, sintaxis moderna y librerías científicas.',
                    'modalidad' => 'Online Sincrónico',
                    'duracion' => '24 Horas',
                    'badge' => 'GRUPO HABILITADO',
                    'imagen' => '/images/landing/crm3.jpg',
                ],
            ];
        }

        return [
            'programas' => $programasHabilitados,
            'modulos' => $modulosHabilitados,
        ];
    }
}
