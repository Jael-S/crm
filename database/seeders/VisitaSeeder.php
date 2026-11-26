<?php

namespace Database\Seeders;

use App\Models\Visita;
use Illuminate\Database\Seeder;

class VisitaSeeder extends Seeder
{
    /**
     * Sembrado inicial para la métrica persistente de visitas.
     */
    public function run(): void
    {
        $paginas = [
            'global' => 1,
            'inicio' => 1,
            'dashboard' => 1,
            'pipeline' => 1,
            'leads' => 1,
            'leads/bolsa-comun' => 1,
            'pagos/revision' => 1,
            'catalogo' => 1,
            'recordatorios' => 1,
            'usuarios' => 1,
            'origenes' => 1,
            'descuentos' => 1,
            'coordinadores/versiones' => 1,
        ];

        foreach ($paginas as $pagina => $contador) {
            Visita::firstOrCreate(
                ['pagina' => $pagina],
                ['contador' => $contador, 'actualizado_en' => now()]
            );
        }
    }
}
