<?php

namespace App\Http\Controllers;

use App\Models\EtapaPipeline;
use App\Models\OrigenLead;
use App\Models\MotivoPerdida;
use Illuminate\Http\Request;

class LookupController extends Controller
{
    /**
     * Retorna todos los catálogos o lookups necesarios para los formularios y vistas.
     */
    public function index()
    {
        return response()->json([
            'etapas_pipeline' => EtapaPipeline::orderBy('orden')->get(),
            'origenes_lead' => OrigenLead::all(),
            'motivos_perdida' => MotivoPerdida::all(),
        ]);
    }
}