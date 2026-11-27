<?php

namespace App\Http\Controllers;

use App\Services\CatalogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    protected CatalogService $catalogService;

    public function __construct(CatalogService $catalogService)
    {
        $this->catalogService = $catalogService;
    }

    /**
     * Obtiene el catálogo completo consumiendo el servicio proxy del Proyecto 2.
     * Renderiza el catálogo procesado para la vista Inertia.
     */
    public function index(Request $request): Response
    {
        if ($request->boolean('refresh') || $request->has('refresh')) {
            Cache::forget('catalogo_externo_data');
        }

        $catalogo = $this->catalogService->getCatalogCompleto();

        return Inertia::render('Catalog/Index', [
            'catalogo' => $catalogo,
        ]);
    }
}