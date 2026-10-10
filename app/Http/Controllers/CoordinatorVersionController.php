<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\CoordinadorVersion;
use App\Services\CatalogService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CoordinatorVersionController extends Controller
{
    protected CatalogService $catalogService;

    public function __construct(CatalogService $catalogService)
    {
        $this->catalogService = $catalogService;
    }

    /**
     * Muestra las versiones externas asociadas a un coordinador específico.
     */
    public function index(int $id): Response
    {
        $coordinador = Usuario::findOrFail($id);
        abort_unless($coordinador->isCoordinador(), 404);

        $catalogo = $this->catalogService->getCatalogCompleto();
        $versionesCatalogo = collect($catalogo['programas'] ?? [])
            ->flatMap(fn (array $programa) => collect($programa['versiones'] ?? [])
                ->map(fn (array $version) => [
                    'id_version_externo' => $version['id'],
                    'nombre' => ($programa['nombre'] ?? 'Programa') . ' - ' . ($version['nombre'] ?? 'Cohorte'),
                ]))
            ->keyBy('id_version_externo');

        $versionesAsignadas = CoordinadorVersion::where('id_usuario', $id)
            ->get(['id_usuario', 'id_version_externo'])
            ->map(function (CoordinadorVersion $asignacion) use ($versionesCatalogo) {
                $version = $versionesCatalogo->get($asignacion->id_version_externo);

                return [
                    'id_usuario' => $asignacion->id_usuario,
                    'id_version_externo' => $asignacion->id_version_externo,
                    'nombre' => $version['nombre'] ?? 'Cohorte no disponible / eliminada',
                    'disponible' => $version !== null,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Coordinadores/Versiones', [
            'coordinador' => $coordinador,
            'versionesAsignadas' => $versionesAsignadas,
            'catalogo' => $catalogo,
        ]);
    }

    public function assignmentIndex(): Response
    {
        $catalogo = $this->catalogService->getCatalogCompleto();
        $programas = collect($catalogo['programas'] ?? []);
        $coordinadores = Usuario::where('activo', true)
            ->whereHas('rol', fn ($query) => $query->where('nombre', 'Coordinador'))
            ->orderBy('nombre_completo')
            ->get(['id_usuario', 'nombre_completo', 'correo'])
            ->map(function (Usuario $coordinador) use ($programas) {
                $assignedIds = CoordinadorVersion::where('id_usuario', $coordinador->id_usuario)
                    ->pluck('id_version_externo');

                return [
                    'id_usuario' => $coordinador->id_usuario,
                    'nombre_completo' => $coordinador->nombre_completo,
                    'correo' => $coordinador->correo,
                    'programas' => $programas
                        ->flatMap(function (array $programa) use ($assignedIds) {
                            return collect($programa['versiones'] ?? [])
                                ->filter(fn (array $version) => $assignedIds->contains($version['id']))
                                ->map(fn (array $version) => [
                                    'id' => $programa['id'],
                                    'id_version_externa' => $version['id'],
                                    'nombre' => $programa['nombre'] . ' — ' . ($version['nombre'] ?? 'Cohorte sin nombre'),
                                    'versiones' => [$version['id']],
                                ]);
                        })
                        ->values()
                        ->all(),
                ];
            });

        return Inertia::render('Coordinadores/Versiones', [
            'coordinadores' => $coordinadores,
            'programas' => $programas->map(fn (array $programa) => [
                'id' => $programa['id'],
                'nombre' => $programa['nombre'],
                'versiones' => collect($programa['versiones'] ?? [])->map(fn (array $version) => [
                    'id' => $version['id'],
                    'nombre' => $version['nombre'] ?? 'Cohorte sin nombre',
                    'fecha_inicio' => $version['fecha_inicio'] ?? null,
                ])->values()->all(),
            ])->values()->all(),
        ]);
    }

    public function store(Request $request, int $id): RedirectResponse
    {
        $coordinador = Usuario::findOrFail($id);
        abort_unless($coordinador->isCoordinador(), 404);

        $validated = $request->validate([
            'id_usuario' => 'nullable|integer|in:'.$coordinador->id_usuario,
            'id_version_externa' => 'nullable|integer|required_without:id_programa_externo',
            'id_programa_externo' => 'nullable|integer|required_without:id_version_externa',
        ]);

        if (! empty($validated['id_programa_externo'])) {
            $programa = collect($this->catalogService->getCatalogCompleto()['programas'] ?? [])
                ->firstWhere('id', $validated['id_programa_externo']);

            abort_if($programa === null, 422, 'El programa seleccionado ya no está disponible.');

            $versionIds = collect($programa['versiones'] ?? [])->pluck('id');
            $hasAssignedVersion = CoordinadorVersion::where('id_usuario', $coordinador->id_usuario)
                ->whereIn('id_version_externo', $versionIds)
                ->exists();

            abort_if($hasAssignedVersion, 422, 'Este programa ya está asignado al coordinador.');

            foreach ($programa['versiones'] ?? [] as $version) {
                CoordinadorVersion::firstOrCreate([
                    'id_usuario' => $coordinador->id_usuario,
                    'id_version_externo' => $version['id'],
                ]);
            }
        } else {
            CoordinadorVersion::firstOrCreate([
                'id_usuario' => $coordinador->id_usuario,
                'id_version_externo' => $validated['id_version_externa'],
            ]);
        }

        return redirect()->back()->with('success', 'Versión asignada correctamente.');
    }

    public function destroy(int $id, int $version): RedirectResponse
    {
        CoordinadorVersion::where('id_usuario', $id)
            ->where('id_version_externo', $version)
            ->delete();

        return redirect()->back()->with('success', 'Versión desasignada correctamente.');
    }

    /**
     * Actualiza (sincroniza) las versiones externas asignadas al coordinador.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $coordinador = Usuario::findOrFail($id);
        abort_unless($coordinador->isCoordinador(), 404);

        $validated = $request->validate([
            'versiones' => 'array',
            'versiones.*' => 'integer',
        ]);

        // Sincronizamos limpiamente eliminando las anteriores y creando las nuevas seleccionadas
        CoordinadorVersion::where('id_usuario', $id)->delete();

        if (!empty($validated['versiones'])) {
            foreach ($validated['versiones'] as $idVersion) {
                CoordinadorVersion::create([
                    'id_usuario' => $id,
                    'id_version_externo' => $idVersion,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Versiones del coordinador actualizadas exitosamente.');
    }
}