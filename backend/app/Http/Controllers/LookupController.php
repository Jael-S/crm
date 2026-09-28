<?php

namespace App\Http\Controllers;

use App\Models\OrigenLead;
use App\Models\EtapaPipeline;
use App\Models\MotivoPerdida;
use Illuminate\Http\JsonResponse;

class LookupController extends Controller
{
    public function origenes(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => OrigenLead::where('activo', true)->get()
        ]);
    }

    public function etapas(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => EtapaPipeline::orderBy('orden')->get()
        ]);
    }

    public function motivosPerdida(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => MotivoPerdida::all()
        ]);
    }
}