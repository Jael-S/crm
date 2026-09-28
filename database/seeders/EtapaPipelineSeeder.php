<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EtapaPipelineSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('etapas_pipeline')->insert([
            ['id_etapa' => 1, 'nombre' => 'Nuevo', 'orden' => 1],
            ['id_etapa' => 2, 'nombre' => 'En Contacto', 'orden' => 2],
            ['id_etapa' => 3, 'nombre' => 'Seguimiento', 'orden' => 3],
            ['id_etapa' => 4, 'nombre' => 'Promesa de Pago', 'orden' => 4],
            ['id_etapa' => 5, 'nombre' => 'Convertido', 'orden' => 5],
            ['id_etapa' => 6, 'nombre' => 'Perdido', 'orden' => 6],
        ]);
    }
}