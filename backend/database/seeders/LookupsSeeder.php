<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LookupsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Orígenes iniciales
        DB::table('origenes_lead')->insert([
            ['nombre' => 'Facebook Ads', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'WhatsApp Directo', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Referido', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Página Web', 'activo' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Las 6 Etapas fijas del Pipeline (según la guía)
        DB::table('etapas_pipeline')->insert([
            ['nombre' => 'Nuevo', 'orden' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Contactado', 'orden' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Interesado', 'orden' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Promesa de Pago', 'orden' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Convertido', 'orden' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Perdido', 'orden' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 3. Motivos de pérdida comunes
        DB::table('motivos_perdida')->insert([
            ['nombre' => 'Sin presupuesto', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'No interesado', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Horario incompatible', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Se inscribió a otra institución', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
