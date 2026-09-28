<?php

namespace App\Http\Controllers;

use App\Models\EtapaPipeline;
use App\Models\OrigenLead;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $rol = $user->rol?->nombre;

        $stats = [
            'total_usuarios' => Usuario::count(),
            'total_vendedores_activos' => Usuario::where('id_rol', 3)->where('activo', true)->count(),
            'total_etapas' => EtapaPipeline::count(),
            'total_origenes' => OrigenLead::count(),
            'mi_round_robin' => (bool) $user->participa_round_robin,
        ];

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'userRol' => $rol,
        ]);
    }
}
