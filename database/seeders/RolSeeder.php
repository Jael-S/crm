<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('roles')->insertOrIgnore([
            [
                'id_rol' => 1,
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso total: gestión de usuarios, asignación de prospectos y reportes globales.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_rol' => 2,
                'nombre' => 'Coordinador',
                'descripcion' => 'Gestión y seguimiento de prospectos asignados a sus programas o versiones.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id_rol' => 3,
                'nombre' => 'Vendedor',
                'descripcion' => 'Gestión comercial de su propia cartera de prospectos y bolsa común.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('roles', 'id_rol'), COALESCE(MAX(id_rol), 1)) FROM roles;");
        }
    }
}
