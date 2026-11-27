<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CatalogService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.catalog_api.url', 'https://proyecto-l1e0.onrender.com/api/v1/catalogo');
    }

    /**
     * Obtiene el catálogo completo mapeando correctamente las cohortes como versiones,
     * filtrando únicamente aquellas que admiten inscripciones según las reglas académicas:
     * - Cohortes de Programa: en_convocatoria, en_curso
     * - Grupos de Módulos: en_convocatoria, habilitado, en_curso
     */
    public function getCatalogCompleto(): array
    {
        try {
            return Cache::remember('catalogo_externo_data', 120, function (): array {
                $response = Http::timeout(10)->get($this->baseUrl);
                $response->throw();
                $data = $response->json();

                // Estados oficiales admitidos según contrato API y reglas académicas de flexibilidad
                $estadosPermitidosCohorte = ['en_convocatoria', 'en_curso'];
                $estadosPermitidosGrupo = ['en_convocatoria', 'habilitado', 'en_curso'];

                $programas = collect($data['programas'] ?? [])->map(function ($programa) use ($estadosPermitidosCohorte) {
                    $precioContado = (float) ($programa['precio_contado'] ?? 0);

                    // Filtrar cohortes: solo las que están abiertas para inscripción
                    $cohortesValidas = collect($programa['cohortes'] ?? [])->filter(function ($cohorte) use ($estadosPermitidosCohorte) {
                        $estado = strtolower(trim($cohorte['estado'] ?? ''));
                        $admite = (bool) ($cohorte['admite_inscripciones'] ?? false);
                        return in_array($estado, $estadosPermitidosCohorte) && $admite;
                    });

                    $programa['versiones'] = $cohortesValidas->map(function ($cohorte) use ($precioContado) {
                        return [
                            'id' => $cohorte['id'],
                            'nombre' => $cohorte['nombre'],
                            'estado' => $cohorte['estado'] ?? 'en_convocatoria',
                            'fecha_inicio' => $cohorte['fecha_inicio'] ?? null,
                            'fecha_fin' => $cohorte['fecha_fin'] ?? null,
                            'admite_inscripciones' => true,
                            'precio' => $precioContado,
                        ];
                    })->values()->toArray();

                    return $programa;
                })->filter(function ($programa) {
                    // Solo conservar programas que tengan al menos una cohorte abierta disponible
                    return !empty($programa['versiones']);
                })->values()->toArray();

                // Filtrar módulos sueltos: solo incluir grupos que admiten inscripción
                $modulosSueltos = collect($data['modulos_sueltos'] ?? [])->map(function ($modulo) use ($estadosPermitidosGrupo) {
                    $gruposValidos = collect($modulo['grupos'] ?? [])->filter(function ($grupo) use ($estadosPermitidosGrupo) {
                        $estado = strtolower(trim($grupo['estado'] ?? ''));
                        $admite = (bool) ($grupo['admite_inscripciones'] ?? false);
                        return in_array($estado, $estadosPermitidosGrupo) && $admite;
                    })->values()->toArray();

                    $modulo['grupos'] = $gruposValidos;
                    return $modulo;
                })->filter(function ($modulo) {
                    // Solo conservar módulos que tengan al menos un grupo abierto
                    return !empty($modulo['grupos']);
                })->values()->toArray();

                return [
                    'programas' => $programas,
                    'modulos_sueltos' => $modulosSueltos,
                ];
            });
        } catch (\Exception $e) {
            Log::error("Error al conectar con la API del Proyecto 2: " . $e->getMessage());
        }

        // Fallback o respuesta vacía segura si hay un fallo de red
        return [
            'programas' => [],
            'modulos_sueltos' => [],
        ];
    }
}