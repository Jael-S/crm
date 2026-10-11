<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MotivoPerdidaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('motivos_perdida')->insert([
            ['id_motivo' => 1, 'nombre' => 'Factor económico'],
            ['id_motivo' => 2, 'nombre' => 'Horario no disponible'],
            ['id_motivo' => 3, 'nombre' => 'Ya no interesado'],
            ['id_motivo' => 4, 'nombre' => 'Sin respuesta'],
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('motivos_perdida', 'id_motivo'), COALESCE(MAX(id_motivo), 1)) FROM motivos_perdida;");
        }
    }
}