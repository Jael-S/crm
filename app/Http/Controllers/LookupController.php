<?php

namespace App\Http\Controllers;

use App\Models\EtapaPipeline;
use App\Models\OrigenLead;
use App\Models\MotivoPerdida;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LookupController extends Controller
{
    /**
     * Retorna la vista Inertia de catálogos o JSON según la petición.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $data = [
            'etapas_pipeline' => EtapaPipeline::orderBy('orden')->get(),
            'origenes_lead' => OrigenLead::orderBy('id_origen')->get(),
            'motivos_perdida' => MotivoPerdida::orderBy('id_motivo')->get(),
        ];

        // Si es una petición API directa (no Inertia)
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json($data);
        }

        return Inertia::render('Catalog/Index', $data);
    }

    /**
     * Endpoint API para orígenes de leads.
     */
    public function origenes(): JsonResponse
    {
        return response()->json(OrigenLead::orderBy('id_origen')->get());
    }

    /**
     * Endpoint API para etapas del pipeline.
     */
    public function etapas(): JsonResponse
    {
        return response()->json(EtapaPipeline::orderBy('orden')->get());
    }

    /**
     * Endpoint API para motivos de pérdida.
     */
    public function motivosPerdida(): JsonResponse
    {
        return response()->json(MotivoPerdida::orderBy('id_motivo')->get());
    }
}