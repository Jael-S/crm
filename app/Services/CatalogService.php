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
     * Obtiene el catálogo completo mapeando correctamente las cohortes como versiones.
     */
    public function getCatalogCompleto(): array
    {
        try {
            return Cache::remember('catalogo_externo_data', 300, function (): array {
                $response = Http::timeout(10)->get($this->baseUrl);
                $response->throw();
                $data = $response->json();

                $programas = collect($data['programas'] ?? [])->map(function ($programa) {
                    $programa['versiones'] = collect($programa['cohortes'] ?? [])->map(function ($cohorte) {
                        return [
                            'id' => $cohorte['id'],
                            'nombre' => $cohorte['nombre'],
                            'estado' => $cohorte['estado'] ?? null,
                            'fecha_inicio' => $cohorte['fecha_inicio'] ?? null,
                        ];
                    })->toArray();

                    return $programa;
                })->toArray();

                return [
                    'programas' => $programas,
                    'modulos_sueltos' => $data['modulos_sueltos'] ?? [],
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