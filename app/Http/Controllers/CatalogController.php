<?php

namespace App\Http\Controllers;

use App\Services\CatalogService;
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
    public function index(): Response
    {
        $catalogo = $this->catalogService->getCatalogCompleto();

        return Inertia::render('Catalog/Index', [
            'catalogo' => $catalogo,
        ]);
    }
}